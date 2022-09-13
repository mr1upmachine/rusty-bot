import { MAX_STATEMENTS } from './constants.js';
import { FULL_EXPRESSION_REGEX, STATEMENT_REGEX } from './roll-regex.js';

/** Validates if a given string is a valid dice statement */
export function validateDiceExpression(expr: string): void {
  if (!expr) {
    throw new Error('No empty expressions!');
  }

  if (!FULL_EXPRESSION_REGEX.test(expr)) {
    throw new Error('Invalid dice expression');
  }

  const matchedArr = expr.match(STATEMENT_REGEX);
  if (matchedArr && matchedArr.length > MAX_STATEMENTS) {
    throw new Error('Too many statements!');
  }
}
