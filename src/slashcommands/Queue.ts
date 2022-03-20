import {
	ApplicationCommandDataResolvable,
	CommandInteraction,
	CacheType,
	Message,
	MessageEmbed,
} from 'discord.js';
import { player } from '..';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';

export class Queue implements SlashCommand {
	name: string = 'queue';
	registerData: ApplicationCommandDataResolvable = {
		name: this.name,
		description: 'View the music queue',
	};
	requiredPermissions: bigint[] = [];
	run(bot: Bot, interaction: CommandInteraction<CacheType>): Promise<void> {
		let queue = player.getQueue(interaction.guild!.id);
		if (!queue || !queue.playing || queue.tracks.length == 0)
			return interaction.reply('There is no queue');
		let ptr = 1;
		let titleString = '';
		let artistString = '';
		let timeString = '';
		let ptrString = '.';
		for (let track of queue.tracks) {
			ptrString = ptr.toString() + ') ';
			if (track.title.length > 45) {
				titleString =
					titleString + ptrString + track.title.slice(0, 43) + '...\n';
			} else {
				titleString = titleString + ptrString + track.title + '\n';
			}
			artistString = artistString + track.author + '\n';
			timeString = timeString + track.duration + '\n';
			ptr++;
			if (ptr == 16) break;
		}
		let footerText = `${Math.round(
			queue.totalTime / 1000 / 60 / 60 - 0.5
		)} hour(s) ${Math.round(
			((queue.totalTime / 1000 / 60 / 60) % 1) * 60
		)} minutes`;
		const embed = new MessageEmbed()
			.setTitle(`Music queue for ${interaction.guild!.name}`)
			.addFields(
				{
					name: '🎶 | Now Playing',
					value: `**${queue.nowPlaying().title}**, by *${
						queue.nowPlaying().author
					}* (${queue.nowPlaying().duration})`,
					inline: false,
				},
				{
					name: '🗒️ | Queue',
					value: titleString,
					inline: true,
				},
				{
					name: '🎙️ | Artist',
					value: artistString,
					inline: true,
				},
				{
					name: '🕐 | Time',
					value: timeString,
					inline: true,
				}
			)
			.setColor('BLUE');
		if (queue.tracks.length - 16 > 0) {
			footerText = `${queue.tracks.length - 16} more tracks, ` + footerText;
		}
		embed.setFooter({ text: footerText });
		return interaction.reply({ embeds: [embed] });
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined;
}
