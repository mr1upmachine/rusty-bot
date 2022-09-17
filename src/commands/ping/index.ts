import type { ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../types/command.js';

export class PingCommand extends Command {
  public readonly name = 'ping';
  public readonly description = 'Replies with Pong!';

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.reply('Pong!');
  }
}
