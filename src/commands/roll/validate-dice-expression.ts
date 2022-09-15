import { RustyBotInvalidArgumentError } from '../../errors/rusty-bot-errors.js';
import { MAX_STATEMENTS } from './constants.js';
import { FULL_EXPRESSION_REGEX, STATEMENT_REGEX } from './constants.js';

/** Validates if a given string is a valid dice statement */
export function validateDiceExpression(expr: string): void {
  if (!expr) {
    throw new RustyBotInvalidArgumentError(
      'expression',
      'No empty expressions!'
    );
  }

  if (!FULL_EXPRESSION_REGEX.test(expr)) {
    throw new RustyBotInvalidArgumentError(
      'expression',
      'Invalid dice expression format'
    );
  }

  const matchedArr = expr.match(STATEMENT_REGEX);
  if (matchedArr && matchedArr.length > MAX_STATEMENTS) {
    throw new RustyBotInvalidArgumentError(
      'expression',
      'Too many statements!'
    );
  }
}
