import type { ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../types/command.js';
import { getPackageJson } from '../../utilities/get-package-json.js';

class AboutCommand extends Command {
  public readonly description =
    'Displays version information and where to contribute';

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const { homepage, version } = await getPackageJson();
    await interaction.reply(
      `Hi, I'm ${interaction.client.user.toString()}! My current version is \`${version}\`!\n\nIf you want to contribute, check us out at ${homepage}`
    );
  }
}

export default AboutCommand;
