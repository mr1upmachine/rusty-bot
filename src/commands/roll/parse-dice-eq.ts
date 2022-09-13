import { DiceStatement } from './dice-statement.js';
import { STATEMENT_REGEX } from './roll-regex.js';
import type { Statement } from './statement.js';
import { ValueStatement } from './value-statement.js';

/** Parses an already validated string into an array of statements */
export function parseDiceEq(expr: string): Statement[] {
  const statementStrings = expr.match(STATEMENT_REGEX) ?? [];
  const statements: Statement[] = [];

  for (const statementString of statementStrings) {
    if (statementString.includes('d')) {
      statements.push(new DiceStatement(statementString));
    } else {
      statements.push(new ValueStatement(statementString));
    }
  }

  return statements;
}
