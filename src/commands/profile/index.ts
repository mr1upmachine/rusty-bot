import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Guild, GuildMember } from 'discord.js';
import { Command } from '../../utilities/command';
import { formatHexColor } from '../../utilities/hex-color-helper';

export default class ProfileCommand extends Command {
  async build() {
    return new SlashCommandBuilder()
      .setName('profile')
      .setDescription('Customize your user card!')
      .addStringOption((option) =>
        option
          .setName('color')
          .setDescription('Hex color code on your user profile')
      )
      .addStringOption((option) =>
        option.setName('about').setDescription('Text on your user profile')
      );
  }

  async execute(interaction: CommandInteraction) {
    const guild = interaction.guild as Guild;
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

      userFirestoreRef.set(
        {
          infoColor: formattedColor
        },
        { merge: true }
      );

      interaction.reply(`Color set to ${formattedColor}!`);
    }

    // TODO break into separate method
    if (about !== null && about !== undefined) {
      if (about.length > 2048) {
        interaction.reply(
          'About sections can only be up to 2048 characters in length!'
        );
        return;
      }

      userFirestoreRef.set({ about }, { merge: true });

      if (about) {
        interaction.reply('About set!');
      } else {
        interaction.reply('About cleared!');
      }
    }
  }
}
