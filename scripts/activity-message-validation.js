const { readFileSync } = require('fs');
const path = require('path');

const ACTIVITY_TYPES = ['Playing', 'Listening to', 'Watching', 'Competing in'];

const messages = readFileSync(
  path.join(__dirname, '../src/assets/activity-messages.txt')
)
  .toString()
  .split('\n')
  .filter((message) => !message.startsWith('//'))
  .filter((message) => message.trim() !== '');

for (const message of messages) {
  if (message.startsWith('//')) {
    continue;
  }

  let valid = false;

  for (const activityType of ACTIVITY_TYPES) {
    const formattedActivityType = `${activityType} `;
    valid =
      message.startsWith(formattedActivityType) &&
      formattedActivityType.length <= 100;
    if (valid) {
      break;
    }
  }

  if (!valid) {
    const typeListStr = ACTIVITY_TYPES.map((type) => `"${type}"`).join(', ');
    console.error(
      `ERROR: "${message}" is not in a valid format. All messages must start with ${typeListStr} and be less then 100 characters`
    );
    process.exitCode = 1;
  }
}
