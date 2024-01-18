import type { ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../types/command.js';
import { formatHexColor } from '../../utilities/hex-color-helper.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';
import {
  InvalidColorStringError,
  RustyBotInvalidArgumentError
} from '../../errors/rusty-bot-errors.js';
import { useGuildMembersRepository } from '../../db/use-guild-members-repository.js';
import type { DBGuildMember } from '../../db/types.js';

const MAX_ABOUT_LENGTH = 2048;

class EditProfileCommand extends Command {
  public readonly description = 'Customize your user card!';

  override build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder
      .addStringOption((option) =>
        option.setName('about').setDescription('Text on your user profile')
      )
      .addStringOption((option) =>
        option
          .setName('color')
          .setDescription('Hex color code on your user profile')
      );
  }

  async execute(
    interaction: ChatInputCommandInteraction<'cached'>
  ): Promise<void> {
    try {
      const guildId = interaction.guild.id;
      const member = interaction.member;

      // Get dependencies
      const guildMembersRepository = useGuildMembersRepository(guildId);

      const color = interaction.options.getString('color') ?? undefined;
      const about = interaction.options.getString('about') ?? undefined;

      const responseMessages: string[] = [];
      let newData: Partial<DBGuildMember> = {};

      await interaction.deferReply({ ephemeral: true });

      if (about !== undefined) {
        if (about.length > MAX_ABOUT_LENGTH) {
          throw new RustyBotInvalidArgumentError(
            'about',
            `About sections can only be up to ${MAX_ABOUT_LENGTH} characters in length!`
          );
        }

        newData = { ...newData, about };

        responseMessages.push(about ? 'About set!' : 'About cleared!');
      }

      if (color !== undefined) {
        const formattedColor = formatHexColor(color);

        newData = { ...newData, infoColor: formattedColor };

        responseMessages.push(`Color set to ${formattedColor}!`);
      }

      // Update db with new data
      await guildMembersRepository.save(member.id, newData);

      const formattedMessage = responseMessages.length
        ? responseMessages.join('\n')
        : 'Nothing changed.';
      await interaction.editReply(formattedMessage);
    } catch (e: unknown) {
      if (e instanceof InvalidColorStringError) {
        throw new RustyBotInvalidArgumentError(
          'color',
          'Argument format is invalid'
        );
      }

      throw e;
    }
  }
}

export default EditProfileCommand;
