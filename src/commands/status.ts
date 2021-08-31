import { SlashCommandBuilder } from '@discordjs/builders';
import { ActivityType, CommandInteraction } from 'discord.js';
import { Command } from '../utilities/command';

export default class StatusCommand extends Command {
  async build() {
    return new SlashCommandBuilder()
      .setName('status')
      .setDescription('Set Rusty\'s current status.')
      .addStringOption(option =>
        option
          .setName('activitytype')
          .setDescription('Type of activity that discord will display')
          .setRequired(true)
          .addChoice('Playing', 'PLAYING')
          .addChoice('Listening', 'LISTENING')
          // Technically, 'streaming' is also an option but it doesn't seem to work without a URL, so I've not enabled it for now.
          // .addChoice('Streaming', 'STREAMING')
          .addChoice('Watching', 'WATCHING')
          .addChoice('Competing', 'COMPETING')
          // .addChoice('Custom', 'CUSTOM')
      )
      .addStringOption(option =>
        option
          .setName('activity')
          .setDescription('Activity text to display as the status')
          .setRequired(true)
      );
  }

  async execute(interaction: CommandInteraction) {
    const activityType = interaction.options.getString('activitytype', true) as ActivityType;
    const activity = interaction.options.getString('activity', true);
    const client = interaction.client;
  
    client.user!.setActivity(activity, { type: activityType })
  
    interaction.reply('Status updated!');
  }
}
