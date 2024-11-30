import type { ChatInputCommandInteraction } from 'discord.js';

import { useGuildMembersRepository } from '../../db/use-guild-members-repository.js';
import {
  InvalidColorStringError,
  RustyBotInvalidArgumentError
} from '../../errors/rusty-bot-errors.js';
import { Command } from '../../types/command.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';
import {
  formatHexColor,
  validateHexColorContrast
} from '../../utilities/hex-color-helper.js';

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

  async execute(
    interaction: ChatInputCommandInteraction<'cached'>
  ): Promise<void> {
    try {
      await interaction.deferReply({ ephemeral: true });

      const guild = interaction.guild;
      const member = interaction.member;
      const roleName = `USER-${member.id}`;
      const role = guild.roles.cache.find(({ name }) => name === roleName);

      // Get dependencies
      const guildMembersRepository = useGuildMembersRepository(guild.id);

      // Get arguments
      const colorArg = interaction.options.getString('hex', true);

      // Adjust hex color to a valid format
      const color = formatHexColor(colorArg);

      // Validate if the color contrast is visible on all discord's themes
      if (!validateHexColorContrast(color)) {
        throw new RustyBotInvalidArgumentError(
          'hex',
          "Provided color code is not readable on one of Discord's themes"
        );
      }

      // Setup accumulators
      let message: string;

      if (role) {
        // Updates existing role with new color
        await role.edit({
          color
        });

        message = `Color changed to ${color}`;
      } else {
        // Creates new role with user selected color
        const createdRole = await guild.roles.create({
          color,
          name: roleName
        });

        // Assigns newly created role to user
        await member.roles.add(createdRole);

        message = `Role created with color ${color}`;
      }

      // Update db with new info
      await guildMembersRepository.save(member.id, {
        color
      });

      // Respond to user
      await interaction.editReply(message);
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
