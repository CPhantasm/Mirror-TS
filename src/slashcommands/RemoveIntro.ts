//Call: Slash command removeintro
//Removes a selected user's intro theme (manager-only moderation tool).
import {
	ChatInputCommandInteraction,
	CacheType,
	ApplicationCommandOptionType,
	MessageFlags,
} from 'discord.js';
import { unlink } from 'fs/promises';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { Option, Subcommand } from './Option';

export class RemoveIntro implements SlashCommand {
	public name = 'removeintro';
	description: string = "[MANAGER] Remove a member's intro theme";
	options: (Option | Subcommand)[] = [
		new Option(
			'user',
			'Member whose intro to remove',
			ApplicationCommandOptionType.User,
			true
		),
	];
	public requiredPermissions: bigint[] = [];
	guildRequired?: boolean = true;
	managerRequired?: boolean = true;

	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		const badUser = interaction.options.getUser('user', true);
		try {
			await unlink(`./data/intros/${interaction.guild!.id}/${badUser.id}.mp4`);
			return interaction.reply({
				content: `Removed ${badUser}'s intro.`,
				flags: MessageFlags.Ephemeral,
			});
		} catch (err: any) {
			if (err && err.code === 'ENOENT') {
				return interaction.reply({
					content: `${badUser} does not have an intro.`,
					flags: MessageFlags.Ephemeral,
				});
			}
			bot.logger.commandError(interaction.channel?.id ?? '', this.name, err);
			return interaction.reply({
				content: 'Error detected, contact an admin for further details.',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}
