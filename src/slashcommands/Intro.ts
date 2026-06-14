//Call: Slash command intro
//Sets a user's intro theme from an uploaded audio/video clip. The clip is trimmed to the
//first 10 seconds and normalized to AAC so the existing VoiceStateUpdate playback can use it.
import {
	ChatInputCommandInteraction,
	CacheType,
	ApplicationCommandOptionType,
	MessageFlags,
} from 'discord.js';
import { spawn } from 'child_process';
import { writeFile, unlink } from 'fs/promises';
import { mkdirpSync } from 'mkdirp';
import ffmpegPath from 'ffmpeg-static';
import { Bot } from '../Bot';
import { SlashCommand } from './SlashCommand';
import { silencedUsers } from './SilenceMember';
import { Option, Subcommand } from './Option';

const INTRO_SECONDS = 10;
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8 MB

export class Intro implements SlashCommand {
	name: string = 'intro';
	description: string =
		'Set your intro theme from an audio/video file (the first 10 seconds are used)';
	options: (Option | Subcommand)[] = [
		new Option(
			'clip',
			'An audio or video file to use as your intro',
			ApplicationCommandOptionType.Attachment,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	guildRequired?: boolean = true;

	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		try {
			let userArray = silencedUsers.ensure(interaction.guild!.id, []);
			if (userArray.includes(interaction.user.id)) {
				return interaction.reply({
					content: 'Silenced users cannot use this command',
					flags: MessageFlags.Ephemeral,
				});
			}

			const clip = interaction.options.getAttachment('clip', true);
			const contentType = clip.contentType ?? '';
			const name = (clip.name ?? '').toLowerCase();
			const looksLikeMedia =
				contentType.startsWith('audio/') ||
				contentType.startsWith('video/') ||
				/\.(mp3|mp4|m4a|wav|ogg|webm|flac|aac|mov)$/.test(name);
			if (!looksLikeMedia) {
				return interaction.reply({
					content: 'Please upload an audio or video file.',
					flags: MessageFlags.Ephemeral,
				});
			}
			if (clip.size > MAX_UPLOAD_BYTES) {
				return interaction.reply({
					content: `That file is too large. Please keep it under ${MAX_UPLOAD_BYTES / (1024 * 1024)} MB.`,
					flags: MessageFlags.Ephemeral,
				});
			}

			await interaction.deferReply({ flags: MessageFlags.Ephemeral });

			const response = await fetch(clip.url);
			if (!response.ok) {
				return interaction.editReply(
					'Could not download that file, please try again.'
				);
			}
			const buffer = Buffer.from(await response.arrayBuffer());

			const dir = `./data/intros/${interaction.guild!.id}`;
			mkdirpSync(dir);
			const outPath = `${dir}/${interaction.user.id}.mp4`;
			const tempPath = `${dir}/${interaction.user.id}.upload`;

			await writeFile(tempPath, buffer);
			try {
				await transcodeIntro(tempPath, outPath);
			} finally {
				await unlink(tempPath).catch(() => {});
			}

			return interaction.editReply('Successfully updated your intro theme!');
		} catch (err) {
			bot.logger.commandError(interaction.channel?.id ?? '', this.name, err);
			const message = 'Error detected, contact an admin to investigate.';
			if (interaction.deferred || interaction.replied) {
				return interaction.editReply(message);
			}
			return interaction.reply({ content: message, flags: MessageFlags.Ephemeral });
		}
	}
}

// Trim to the first INTRO_SECONDS seconds and re-encode to AAC audio in an mp4 container
// using the bundled ffmpeg binary. The input is a real (seekable) file so any container works.
function transcodeIntro(inputPath: string, outPath: string): Promise<void> {
	return new Promise((resolve, reject) => {
		if (!ffmpegPath) return reject(new Error('ffmpeg binary not available'));
		const ff = spawn(ffmpegPath, [
			'-y',
			'-i', inputPath,
			'-t', String(INTRO_SECONDS),
			'-vn',
			'-acodec', 'aac',
			'-b:a', '128k',
			outPath,
		]);
		let stderr = '';
		ff.stderr.on('data', (chunk) => (stderr += chunk.toString()));
		ff.on('error', reject);
		ff.on('close', (code) => {
			if (code === 0) resolve();
			else reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-500)}`));
		});
	});
}
