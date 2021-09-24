import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, Guild, GuildMember } from 'discord.js';
import { Command } from '../utilities/command';

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
      const isValidHex = /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i.test(color);
      if (!isValidHex) {
        throw new Error('Please input a valid hex color code!');
      }

      let newColor = color;
      const isShortenedHex = /(^#?[0-9A-F]{3}$)/i.test(color);
      if (isShortenedHex) {
        newColor = color.replace(
          /#?([0-9A-F])([0-9A-F])([0-9A-F])/,
          '$1$1$2$2$3$3'
        );
      }

      userFirestoreRef.set(
        {
          infoColor: newColor
        },
        { merge: true }
      );

      interaction.reply(`Color set to ${newColor}!`);
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
