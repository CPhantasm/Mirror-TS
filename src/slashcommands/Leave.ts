//Call: Slash command leave
//Has Mirror leave the voice channel it is in for this guild.
import { getVoiceConnection } from '@discordjs/voice';
import {
	ChatInputCommandInteraction,
	CacheType,
	PermissionFlagsBits,
	MessageFlags,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Leave implements SlashCommand {
	name: string = 'leave';
	description: string = 'Have Mirror leave your voice channel';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [PermissionFlagsBits.SendMessages];
	guildRequired?: boolean = true;
	blockSilenced?: boolean = true;

	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		try {
			// prefer tearing down the @discordjs/voice connection (the clean way Mirror joins)
			const connection = getVoiceConnection(interaction.guild!.id);
			if (connection) {
				connection.destroy();
				return interaction.reply('Left the voice channel :wave:');
			}
			// fallback: Mirror is in a channel without an active connection object
			const mirrorVoice = interaction.guild!.members.me!.voice;
			if (mirrorVoice.channel) {
				await mirrorVoice.disconnect();
				return interaction.reply('Left the voice channel :wave:');
			}
			return interaction.reply({
				content: 'I am not in a voice channel.',
				flags: MessageFlags.Ephemeral,
			});
		} catch (err) {
			bot.logger.commandError(interaction.channel?.id ?? '', this.name, err);
			return interaction.reply({
				content: 'Error: contact a developer to investigate',
				flags: MessageFlags.Ephemeral,
			});
		}
	}
}
