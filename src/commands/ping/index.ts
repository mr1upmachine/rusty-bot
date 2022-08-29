import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { Command } from '../../utilities/command';

export default class PingCommand extends Command {
  async build() {
    return new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Replies with Pong!');
  }

  async execute(interaction: ChatInputCommandInteraction) {
    interaction.reply('Pong!');
  }
}
