import type {
  ChatInputCommandInteraction,
  ColorResolvable,
  GuildMember
} from 'discord.js';

import { Command } from '../../types/command.js';
import { formatHexColor } from '../../utilities/hex-color-helper.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';

export class ColorCommand extends Command {
  public readonly name = 'color';
  public readonly description = "Changes the color of the user's name.";

  override build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder.addStringOption((option) =>
      option
        .setName('hex')
        .setDescription('A hexadecimal color code')
        .setRequired(true)
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const roleName = `USER-${interaction.member!.user.id}`;
    const myRole = interaction.guild!.roles.cache.find(
      (role: { name: string }) => role.name === roleName
    );
    const color = interaction.options.getString('hex', true).toUpperCase();
    const formattedColor = formatHexColor(color);

    if (!myRole) {
      try {
        const createdRole = await interaction.guild!.roles.create({
          // Creates new role with user selected color
          color: formattedColor as ColorResolvable,
          name: roleName
        });

        const member = interaction.member as GuildMember;
        await member.roles.add(createdRole); // Assigns newly created role to user

        await interaction.reply(`Role created with color ${formattedColor}`);
      } catch (e: unknown) {
        await interaction.reply('Error creating role.');
        // eslint-disable-next-line @typescript-eslint/no-throw-literal
        throw e;
      }
    } else {
      // Updates existing role with new color
      await myRole.edit({
        color: formattedColor as ColorResolvable
      });
      await interaction.reply(`Color changed to ${formattedColor}`);
    }
  }
}
