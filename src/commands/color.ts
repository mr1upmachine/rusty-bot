import { SlashCommandBuilder } from '@discordjs/builders';
import { ColorResolvable, CommandInteraction, GuildMember } from 'discord.js';
import { Command } from '../utilities/command';

export default class ColorCommand extends Command {
  async build() {
    return new SlashCommandBuilder()
      .setName('color')
      .setDescription("Changes the color of the user's name.")
      .addStringOption((option) =>
        option
          .setName('hex')
          .setDescription('A hex based color code')
          .setRequired(true)
      );
  }

  async execute(interaction: CommandInteraction) {
    const roleName = `USER-${interaction.member!.user.id}`;
    const myRole = interaction.guild!.roles.cache.find(
      (role: { name: string }) => role.name === roleName
    );
    let chosenColor = interaction.options.getString('hex', true).toUpperCase();

    const isValidHex = /(^#?[0-9A-F]{6}$)|(^#?[0-9A-F]{3}$)/i.test(chosenColor); // Test if chosenColor is valid
    if (!isValidHex) {
      throw new Error('Please input a valid hex color code!'); // Output error message to discord channel
      return;
    }

    const isShortenedHex = /(^#?[0-9A-F]{3}$)/i.test(chosenColor); // Tests if chosenColor is a 3 character code
    if (isShortenedHex) {
      chosenColor = chosenColor.replace(
        /#?([0-9A-F])([0-9A-F])([0-9A-F])/,
        '#$1$1$2$2$3$3'
      ); // Convert 3 character hex codes to 6 characters
    }

    if (!myRole) {
      try {
        const createdRole = await interaction.guild!.roles.create({
          // Creates new role with user selected color
          color: chosenColor as ColorResolvable,
          name: roleName
        });

        const member = interaction.member as GuildMember;
        member.roles.add(createdRole); // Assigns newly created role to user

        interaction.reply(`Role created with color ${chosenColor}`);
      } catch (e) {
        return;
      }
    } else {
      // Updates existing role with new color
      myRole.edit({
        color: chosenColor as ColorResolvable
      });
      interaction.reply(`Color changed to ${chosenColor}`);
    }
  }
}
