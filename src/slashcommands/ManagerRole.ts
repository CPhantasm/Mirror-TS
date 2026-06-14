import { MessageFlags,
	ChatInputCommandInteraction,
	CacheType,
	PermissionFlagsBits,
	EmbedBuilder,
	ApplicationCommandOptionType,
	Role
} from 'discord.js';
import Enmap from 'enmap';
import { Bot } from '../Bot';
import { Option, Subcommand } from './Option';
import { SlashCommand } from './SlashCommand';

export const managerRoles = new Enmap({ name: 'managerRoles' });

export class ManagerRole implements SlashCommand {
	name: string = 'managerrole';
	description: string = '[MANAGER] Add or remove a role as a manager';
	options: (Option | Subcommand)[] = [
		new Option(
			'role',
			'The role you want to add or remove as a manager',
			ApplicationCommandOptionType.Role,
			true
		),
	];
	requiredPermissions: bigint[] = [];
	async run(
		bot: Bot,
		interaction: ChatInputCommandInteraction<CacheType>
	): Promise<any> {
		let role = interaction.options.getRole('role') as Role;
		if (role.managed) {
			return interaction.reply({
				content:
					'Cannot set externally managed roles, or bot roles as Mirror Managers',
				flags: MessageFlags.Ephemeral,
			});
		}
		let roleArray = managerRoles.ensure(interaction.guild!.id, []);
		if (roleArray.includes(role.id)) {
			let ptr = roleArray.indexOf(role.id);
			roleArray.splice(ptr, 1);
			managerRoles.set(interaction.guild!.id, roleArray);
			return interaction.reply({
				content: `Successfully removed ${role} as a Mirror Manager`,
				flags: MessageFlags.Ephemeral,
			});
		}

		//I fully expect us to never need this but if someone is just needlessly adding we should stop it
		if (roleArray.length > 15) {
			return interaction.reply({
				content:
					'Mirror limits servers to 15 manager roles. Please remove manager roles before adding more. If this is not possible contact a developer for more options',
				flags: MessageFlags.Ephemeral,
			});
		}
		roleArray.push(role.id);
		managerRoles.set(interaction.guild!.id, roleArray);
		return interaction.reply({
			content: `Successfully added ${role} as a Mirror Manager`,
			flags: MessageFlags.Ephemeral,
		});
	}
	guildRequired?: boolean | undefined = true;
	managerRequired?: boolean | undefined = true;
}
