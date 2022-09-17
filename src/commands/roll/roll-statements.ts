import type { Statement } from './statements.js';

/** Calculates all statements created */
export function rollStatements(statements: readonly Statement[]): number {
  return statements.reduce((total, statement) => total + statement.calc(), 0);
}
