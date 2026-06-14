//Call: Slash command join
//Has Mirror join the caller's current voice channel and announce itself with the mirror theme.
//Useful for getting Mirror into a channel so intros play (alternative to a configured /defaultvc).
import {
	joinVoiceChannel,
	createAudioPlayer,
	createAudioResource,
} from '@discordjs/voice';
import {
	ChatInputCommandInteraction,
	CacheType,
	GuildMember,
	PermissionFlagsBits,
	MessageFlags,
} from 'discord.js';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export class Join implements SlashCommand {
	name: string = 'join';
	description: string = 'Have Mirror join your voice channel';
	options: (Option | Subcommand)[] = [];
	requiredPermissions: bigint[] = [PermissionFlagsBits.SendMessages];
	guildRequired?: boolean = true;
	blockSilenced?: boolean = true;

	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		try {
			const member = interaction.member as GuildMember;
			const state = member.voice;
			if (!state.channel) {
				return interaction.reply({
					content: 'You are not in a voice channel!',
					flags: MessageFlags.Ephemeral,
				});
			}
			if (
				!interaction.guild?.members.me
					?.permissionsIn(state.channel.id)
					.has(PermissionFlagsBits.Connect)
			) {
				return interaction.reply({
					content: 'I do not have permission to connect to that voice channel.',
					flags: MessageFlags.Ephemeral,
				});
			}

			const connection = joinVoiceChannel({
				channelId: state.channelId!,
				guildId: interaction.guildId!,
				adapterCreator: interaction.guild!.voiceAdapterCreator,
			});
			//code copied from discord#9185 -- keeps the UDP socket alive so Mirror is not
			//silently dropped from the channel after a few minutes
			//@ts-ignore
			connection.on('stateChange', (oldState, newState) => {
				const oldNetworking = Reflect.get(oldState, 'networking');
				const newNetworking = Reflect.get(newState, 'networking');
				const networkStateChangeHandler = (oldNetworkState: any, newNetworkState: any) => {
					const newUdp = Reflect.get(newNetworkState, 'udp');
					clearInterval(newUdp?.keepAliveInterval);
				};
				oldNetworking?.off('stateChange', networkStateChangeHandler);
				newNetworking?.on('stateChange', networkStateChangeHandler);
			});

			const player = createAudioPlayer();
			player.on('error', (err) => {
				bot.logger.commandError(interaction.channel?.id ?? '', this.name, err);
			});
			connection.subscribe(player);
			player.play(createAudioResource('./music/mirror.mp3'));

			return interaction.reply({
				content: 'Joined your voice channel!',
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
