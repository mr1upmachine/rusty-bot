import { Client, Message } from 'discord.js';

exports.run = (client: Client, msg: Message, args: string[]) => {
  // Joins args together in case spaces are in the expression
  const diceEq = args.join('').replace(' ', '').toLowerCase();

  const result = roll(diceEq);

  msg.channel.send(result);
};

exports.help = {
  description: 'Roll some dice! Input any dice euqation and recieve a result.',
  name: 'Roll',
  usage: 'roll 2d6+5',
};

const VALIDATION_REGEX = /(([\+\-\*\/]?(\(*[0-9]*d[0-9]+([\^v][0-9]+)?)+\)*)|(\(*[\+\-\*\/]?[0-9]+\)*))+/g;
const PAREN_GROUP_REGEX = /\(.+\)/g;
const DICE_REGEX = /[0-9]*d[0-9]+([\^v][0-9])?/g;
const DICE_SYMBOL = 'd';
const ADV_SYMBOL = '^';
const DIS_SYMBOL = 'v';

function roll(diceExpr: string): string | number {
  // Validate if pattern only contains dice expressions
  if (!diceExpr && !diceExpr.match(VALIDATION_REGEX)) { return NaN; }

  const parsedExpr = evalExpr(diceExpr);
  // tslint:disable-next-line:no-eval
  return `${diceExpr} => ${parsedExpr} => ${eval(parsedExpr)}`;
}

// TODO: Investigate optimizations through rxjs
// TODO: Add string building for resolved dice eq
function evalExpr(expr: string): string {
  // Eval paren groups first
  const parenGroup = expr.match(PAREN_GROUP_REGEX);
  if (parenGroup && parenGroup.length) {
    for (const group of parenGroup) {
      const result = evalExpr(group.substring(1, group.length - 1));
      expr = expr.replace(group, `(${result})`);
    }
  }

  // Get all the dice in an array
  const dice = expr.match(DICE_REGEX);
  if (!dice || !dice.length) { return expr; }

  // Iterate through the dice
  for (const die of dice) {
    // Get index values for each key character
    const indexOfD = die.indexOf(DICE_SYMBOL);
    const numDie = indexOfD
                    ? Number.parseInt(die.substring(0, indexOfD), 10)
                    : 1;
    const indexOfAdv = die.indexOf(ADV_SYMBOL);
    const indexOfDis = die.indexOf(DIS_SYMBOL);

    let rollResults: number[] = [];
    if (indexOfAdv !== -1) { // IF has advantage symbol
      const dieValue = Number.parseInt(die.substring(indexOfD + 1, indexOfAdv), 10);
      const advValue = Number.parseInt(die.substring(indexOfAdv + 1), 10);

      rollResults = generateRollArray(numDie, dieValue);
      rollResults.splice(0, rollResults.length - advValue);
    } else if (indexOfDis !== -1) { // ELSE IF has disadvangage symbol
      const dieValue = Number.parseInt(die.substring(indexOfD + 1, indexOfDis), 10);
      const disValue = Number.parseInt(die.substring(indexOfDis + 1), 10);

      rollResults = generateRollArray(numDie, dieValue);
      const disOffset = rollResults.length - disValue;
      rollResults.splice(disOffset - 1, disOffset);
    } else { // ELSE a normal dice roll
      const dieValue = Number.parseInt(die.substring(indexOfD + 1), 10);
      rollResults = generateRollArray(numDie, dieValue);
    }

    // Add up all results and place back into string expr for recursion support
    const rollTotal = rollResults.reduce((a, b) => a + b, 0);
    expr = expr.replace(die, rollTotal.toString());
  }

  return expr;
}

/** Rolls dice individually */
function generateRollArray(numDie: number, dieValue: number): number[] {
  const rollResults: number[] = [];
  for (let i = 0; i < numDie; i++) {
    rollResults.push(Math.floor((Math.random() * dieValue) + 1));
  }
  return rollResults.sort((a, b) => a - b);
}
