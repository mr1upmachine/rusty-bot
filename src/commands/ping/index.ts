import type { ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../types/command.js';

class PingCommand extends Command {
  public readonly description = 'Replies with Pong!';

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Pong!');
  }
}

export default PingCommand;
