import { Statement } from './statement.js';

export class ValueStatement extends Statement {
  public value: number;

  constructor(statementString: string) {
    const negative = statementString.startsWith('-');
    super(negative);
    const newStatementString = statementString.slice(1);

    this.value = parseInt(newStatementString, 10);
  }

  calc(): number {
    return this.negative ? this.value * -1 : this.value;
  }
}
