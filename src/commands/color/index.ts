import { SlashCommandBuilder } from '@discordjs/builders';
import { ColorResolvable, CommandInteraction, GuildMember } from 'discord.js';
import { Command } from '../../utilities/command';
import { formatHexColor } from '../../utilities/hex-color-helper';

export default class ColorCommand extends Command {
  async build() {
    return new SlashCommandBuilder()
      .setName('color')
      .setDescription("Changes the color of the user's name.")
      .addStringOption((option) =>
        option
          .setName('hex')
          .setDescription('A hexadecimal color code')
          .setRequired(true)
      );
  }

  async execute(interaction: CommandInteraction) {
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
        member.roles.add(createdRole); // Assigns newly created role to user

        interaction.reply(`Role created with color ${formattedColor}`);
      } catch (e) {
        return;
      }
    } else {
      // Updates existing role with new color
      myRole.edit({
        color: formattedColor as ColorResolvable
      });
      interaction.reply(`Color changed to ${formattedColor}`);
    }
  }
}
