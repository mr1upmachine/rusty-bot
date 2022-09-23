import type { ChatInputCommandInteraction } from 'discord.js';

import { Command } from '../../types/command.js';
import { coerceDiceEq } from './coerce-dice-eq.js';
import { parseDiceEq } from './parse-dice-eq.js';
import { rollStatements } from './roll-statements.js';
import { validateDiceExpression } from './validate-dice-expression.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder';

class RollCommand extends Command {
  public readonly description =
    'Roll some dice! Input a dice equation and receive a result.';

  override build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder.addStringOption((option) =>
      option
        .setName('expression')
        .setDescription(
          "Equations may only contain addition & subtraction and numbers can't be larger then 3 digits long"
        )
        .setRequired(true)
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    try {
      // Joins args together in case spaces are in the expression
      const expression = interaction.options.getString('expression', true);
      const diceEq = coerceDiceEq(expression);

      validateDiceExpression(diceEq);

      const statements = parseDiceEq(diceEq);

      const result = rollStatements(statements);

      await interaction.reply(`${result}`);
    } catch (e: unknown) {
      await interaction.reply((e as Error).message);
    }
  }
}

export default RollCommand;
