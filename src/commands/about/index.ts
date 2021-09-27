import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';
import { Command } from '../../utilities/command';
import { version } from '../../utilities/version';

export default class AboutCommand extends Command {
  async build() {
    return new SlashCommandBuilder()
      .setName('about')
      .setDescription('Displays version information');
  }

  async execute(interaction: CommandInteraction) {
    interaction.reply(
      `Hi, I'm Rusty, mascot of the Rusty's Bois server! My current version is ${version}!`
    );
  }
}
