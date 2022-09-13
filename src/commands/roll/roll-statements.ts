import type { Statement } from './statement.js';

/** Calculates all statements created */
export function rollStatements(statements: readonly Statement[]): number {
  return statements.reduce((total, statement) => total + statement.calc(), 0);
}
