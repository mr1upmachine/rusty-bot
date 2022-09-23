import type { ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../types/command.js';
import { getVersion } from '../../utilities/get-version.js';

class VersionCommand extends Command {
  public readonly description = 'Displays version information';

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const version = await getVersion();
    await interaction.reply(`My current version is \`${version}\`!`);
  }
}

export default VersionCommand;
