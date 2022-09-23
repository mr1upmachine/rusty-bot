import type {
  ChatInputCommandInteraction,
  ColorResolvable,
  GuildMember
} from 'discord.js';

import { Command } from '../../types/command.js';
import {
  formatHexColor,
  validateHexColorContrast
} from '../../utilities/hex-color-helper.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';
import {
  InvalidColorStringError,
  RustyBotInvalidArgumentError
} from '../../errors/rusty-bot-errors.js';

export class ColorCommand extends Command {
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

    try {
      const formattedColor = formatHexColor(color);

      if (!validateHexColorContrast(formattedColor)) {
        throw new RustyBotInvalidArgumentError(
          'hex',
          "Provided color code is not readable on one of Discord's themes"
        );
      }

      let message: string;
      if (!myRole) {
        const createdRole = await interaction.guild!.roles.create({
          // Creates new role with user selected color
          color: formattedColor as ColorResolvable,
          name: roleName
        });

        const member = interaction.member as GuildMember;
        await member.roles.add(createdRole); // Assigns newly created role to user

        message = `Role created with color ${formattedColor}`;
      } else {
        // Updates existing role with new color
        await myRole.edit({
          color: formattedColor as ColorResolvable
        });

        message = `Color changed to ${formattedColor}`;
      }

      // Inform user of success
      await interaction.reply({
        content: message,
        ephemeral: true
      });
    } catch (e: unknown) {
      if (e instanceof InvalidColorStringError) {
        throw new RustyBotInvalidArgumentError(
          'hex',
          'Argument format is invalid'
        );
      }

      throw e;
    }
  }
}

export default ColorCommand;
