import { Client, Message } from 'discord.js';

exports.run = async (client: Client, msg: Message, args: string[]) => {
  try {
    // Joins args together in case spaces are in the expression
    const diceEq = coerceDiceEq(args.join(''));

    await validate(diceEq);

    const statements = await parse(diceEq);

    const result = await roll(statements);

    msg.channel.send(result);
  } catch (e) {
    msg.channel.send((e as Error).message);
  }
};

exports.help = {
  description:
    "Roll some dice! Input a dice equation and receive a result. Equations may only contain addition & subtraction and numbers can't be larger then 3 digits long",
  name: 'Roll',
  usage: 'roll 2d6+5',
};

// DATA MODELS

abstract class Statement {
  constructor(public negative?: boolean) {}

  /** Calculate the value based on object properties */
  public abstract calc(): number;
}

class DiceStatement extends Statement {
  public sides: number;
  public numberOfDice: number;

  constructor(statementString: string) {
    const negative = statementString.startsWith('-');
    super(negative);
    statementString = statementString.slice(1);

    const index = statementString.indexOf('d');

    this.numberOfDice = index === 0 ? 1 : parseInt(statementString.substring(0, index), 10);
    this.sides = parseInt(statementString.substring(index + 1), 10);
  }

  public calc(): number {
    let total = 0;
    for (let i = 0; i < this.numberOfDice; i++) {
      const result = Math.floor(Math.random() * this.sides);
      total += result + 1;
    }
    return this.negative ? total * -1 : total;
  }
}

class ValueStatement extends Statement {
  public value: number;

  constructor(statementString: string) {
    const negative = statementString.startsWith('-');
    super(negative);
    statementString = statementString.slice(1);

    this.value = parseInt(statementString, 10);
  }

  public calc(): number {
    return this.negative ? this.value * -1 : this.value;
  }
}

function coerceDiceEq(expr: string): string {
  let newExpr = expr.replace(/[ ()]/g, '').toLowerCase();

  if (!newExpr.startsWith('+') && !newExpr.startsWith('-')) {
    newExpr = `+${expr}`;
  }

  return newExpr;
}

// END DATA MODELS

const FULL_EXPRESSION_REGEX = /^([+-]([0-9]{0,3}d[0-9]{1,3}|[+-]?([0-9]{1,3})))+$/i;
const STATEMENT_REGEX = /[+-]([0-9]{0,3}d[0-9]{1,3}|[+-]?([0-9]{1,3}))/gi;

/** Validates if a given string is a valid dice statement */
async function validate(expr: string): Promise<void> {
  if (!expr) {
    throw new Error('No empty expressions!');
  }

  if (!FULL_EXPRESSION_REGEX.test(expr)) {
    throw new Error('Invalid dice expression');
  }

  const matchedArr = expr.match(STATEMENT_REGEX);
  if (matchedArr && matchedArr?.length > 15) {
    throw new Error('Too many statements!');
  }
}

/** Parses an already validated string into an array of statements */
async function parse(expr: string): Promise<Statement[]> {
  const statementStrings = expr.match(STATEMENT_REGEX) || [];
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

/** Calculates all statements created */
async function roll(statements: Statement[]): Promise<number> {
  let total = 0;

  for (const statement of statements) {
    total += statement.calc();
  }

  return total;
}
