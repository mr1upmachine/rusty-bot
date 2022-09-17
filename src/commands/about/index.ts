import type { ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../types/command.js';
import { getVersion } from '../../utilities/get-version.js';

export class AboutCommand extends Command {
  public readonly name = 'about';
  public readonly description = 'Displays version information';

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const version = await getVersion();
    await interaction.reply(
      `Hi, I'm Rusty, mascot of the Rusty's Bois server! My current version is \`${version}\`!`
    );
  }
}
