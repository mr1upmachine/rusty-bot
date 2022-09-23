import type { ChatInputCommandInteraction } from 'discord.js';
import MersenneTwister from 'mersenne-twister';

import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';
import { Command } from '../../types/command.js';

// TODO: Evaluate the spread of the modifier generation
// TODO: Improve message formatting
// TODO: Implement dong leaderboard
// TODO: Allow people to regenerate their dong on occasion (need to redesign how hash works)
// TODO: Add gifs maybe?

class SizeCommand extends Command {
  public readonly description = 'Measure the size of your dong!';

  override build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder.addUserOption((option) =>
      option.setName('user').setDescription('User to get size of')
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const user = interaction.options.getUser('user') ?? interaction.user;

    const hash = this._hashCode(user.id);
    const displayId = /^\d+$/.test(user.id) ? `<@!${user.id}>` : user.id; // Adds mention characters
    const generator = new MersenneTwister(hash);
    const modifier = this._determineSize(hash);
    let size = 0;
    let message = '';

    switch (modifier) {
      case 'magnum':
        size = generator.random() * 5 + 5;
        message += `Wow ${displayId} you got a *MAGNUM* dong!`;
        break;
      case 'normal':
        size = generator.random() * 3 + 3;
        message += `Hey ${displayId} it's not the size of the wave, it's the motion of the ocean.`;
        break;
      case 'micro':
        size = generator.random() * 3;
        message += `Uhh.. ${displayId}, where is it..?`;
        break;
    }
    message += `\nYour dong is ${size.toFixed(2)} inches!`;

    const donger = `8${'='.repeat(Math.floor(size))}D`;

    message += `\nEveryone look at ${displayId}'s dong: ${donger}`;
    await interaction.reply(message);
  }

  private _hashCode(x: string): number {
    let hash = 0;
    if (x.length === 0) {
      return hash;
    }

    for (let i = 0; i < x.length; i++) {
      const chr = x.charCodeAt(i);
      hash = (hash << 5) - hash + chr;
      hash |= 0; // Convert to 32bit integer
    }
    return hash;
  }

  private _determineSize(hash: number): 'magnum' | 'micro' | 'normal' {
    const modulo = Math.abs(hash) % 100;
    if (modulo < 10) {
      return 'micro';
    } else if (modulo > 85) {
      return 'magnum';
    }

    return 'normal';
  }
}

export default SizeCommand;
