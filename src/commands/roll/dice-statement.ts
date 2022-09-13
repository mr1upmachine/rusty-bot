import { Statement } from './statement.js';

export class DiceStatement extends Statement {
  public sides: number;
  public numberOfDice: number;

  constructor(statementString: string) {
    const negative = statementString.startsWith('-');
    super(negative);
    const newStatementString = statementString.slice(1);

    const index = newStatementString.indexOf('d');

    this.numberOfDice =
      index === 0 ? 1 : parseInt(newStatementString.substring(0, index), 10);
    this.sides = parseInt(newStatementString.substring(index + 1), 10);
  }

  calc(): number {
    let total = 0;
    for (let i = 0; i < this.numberOfDice; i++) {
      const result = Math.floor(Math.random() * this.sides);
      total += result + 1;
    }
    return this.negative ? total * -1 : total;
  }
}
