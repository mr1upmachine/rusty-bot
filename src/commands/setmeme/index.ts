import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction, GuildMember } from 'discord.js';
import { Command } from '../../utilities/command';

export default class SetMemeCommand extends Command {
  async build() {
    return new SlashCommandBuilder()
      .setName('setmeme')
      .setDescription('Sets the meme channel for stat tracking')
      .addBooleanOption((option) =>
        option
          .setName('value')
          .setDescription(
            'Boolean whether the meme channel should be set to this or not'
          )
          .setRequired(true)
      );
  }

  async execute(interaction: CommandInteraction) {
    const guildId = interaction.guildId!;
    const member = interaction.member as GuildMember;
    const channelName = interaction.channel?.toString();
    const channelId = interaction.channelId;
    let meme = interaction.options.getBoolean('value', true);

    // Ensures only admins may use this command
    if (member.permissions.has('ADMINISTRATOR')) {
      interaction.reply(
        'Insufficient permissions. Only Administrators may use this command.'
      );
      return;
    }

    const docRef = this.firestore
      .collection('guilds')
      .doc(guildId)
      .collection('channels')
      .doc(channelId);

    docRef.set({ meme }, { merge: true });

    interaction.reply(`Meme channel set to ${channelName}.`);
  }
}
