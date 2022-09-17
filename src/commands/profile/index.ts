import type { ChatInputCommandInteraction, GuildMember } from 'discord.js';

import { Command } from '../../types/command.js';
import { formatHexColor } from '../../utilities/hex-color-helper.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';

const MAX_ABOUT_LENGTH = 2048;

export class ProfileCommand extends Command {
  public readonly name = 'profile';
  public readonly description = 'Customize your user card!';

  override build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder
      .addStringOption((option) =>
        option
          .setName('color')
          .setDescription('Hex color code on your user profile')
      )
      .addStringOption((option) =>
        option.setName('about').setDescription('Text on your user profile')
      );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const guild = interaction.guild!;
    const member = interaction.member as GuildMember;

    const color = interaction.options.getString('color');
    const about = interaction.options.getString('about');

    const userFirestoreRef = this.firestore
      .collection('guilds')
      .doc(guild.id)
      .collection('members')
      .doc(member.id);

    if (color) {
      const formattedColor = formatHexColor(color);

      await userFirestoreRef.set(
        {
          infoColor: formattedColor
        },
        { merge: true }
      );

      await interaction.reply(`Color set to ${formattedColor}!`);
    }

    // TODO break into separate method
    if (about === null) {
      await interaction.reply('Nothing entered.');
      return;
    }

    if (about.length > MAX_ABOUT_LENGTH) {
      await interaction.reply(
        'About sections can only be up to 2048 characters in length!'
      );
      return;
    }

    await userFirestoreRef.set({ about }, { merge: true });

    if (about) {
      await interaction.reply('About set!');
    } else {
      await interaction.reply('About cleared!');
    }
  }
}
