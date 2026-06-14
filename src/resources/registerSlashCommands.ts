import { Bot } from '../Bot';

async function clearGuildCommands(bot: Bot, guildId: string) {
	const guild = bot.client.guilds.cache.get(guildId);
	if (guild) await guild.commands.set([]);
}

export async function registerSlashCommands(bot: Bot): Promise<boolean> {
	bot.logger.info('Registering slash commands');
	if (!bot.client.application?.owner) await bot.client.application?.fetch(); // make sure the bot is fully fetched
	await bot.client.guilds.fetch(); // make sure the guilds are fully fetched

	// build the command payloads once. A single bulk overwrite (.set) registers everything
	// atomically, removes any stale commands (e.g. the retired music commands), and avoids the
	// per-command rate limits the old create-in-a-loop approach was prone to.
	const commandData = bot.slashCommands.map((command) => ({
		name: command.name,
		description: command.description,
		options: command.options.map((option) => option.toJson()),
	}));

	if (bot.mode == 'debug') {
		// guild-scoped commands update instantly -- clear the global set so we don't see duplicates
		await bot.client.application?.commands.set([]);
		const guild = bot.client.guilds.cache.get(bot.test_server);
		if (guild) await guild.commands.set(commandData as any);
		bot.logger.info(
			`Registered ${commandData.length} guild commands to test server ${bot.test_server}`
		);
	} else {
		// debug mode only ever registers guild commands to the test server, so clearing it is
		// enough to drop leftovers before we register everything globally
		await clearGuildCommands(bot, bot.test_server);
		await bot.client.application?.commands.set(commandData as any);
		bot.logger.info(`Registered ${commandData.length} global commands`);
	}
	return true;
}
