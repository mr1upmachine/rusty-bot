import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';

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
import { getMemberFirestoreReference } from '../../utilities/firestore-helper.js';

const MAX_ABOUT_LENGTH = 2048;

export class EditProfileCommand extends Command {
  public readonly name = 'edit-profile';
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

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const member = interaction.member as GuildMember;

    const color = interaction.options.getString('color');
    const about = interaction.options.getString('about');

    const responseMessages: string[] = [];

    await interaction.deferReply();

    try {
      const userFirestoreRef = getMemberFirestoreReference(
        this.firestore,
        member
      );

      if (about !== null) {
        if (about.length > MAX_ABOUT_LENGTH) {
          throw new RustyBotInvalidArgumentError(
            'about',
            `About sections can only be up to ${MAX_ABOUT_LENGTH} characters in length!`
          );
        }

        await userFirestoreRef.set({ about }, { merge: true });

        responseMessages.push(about ? 'About set!' : 'About cleared!');
      }

      if (color !== null) {
        const formattedColor = formatHexColor(color);

        await userFirestoreRef.set(
          {
            infoColor: formattedColor
          },
          { merge: true }
        );

        responseMessages.push(`Color set to ${formattedColor}!`);
      }

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
