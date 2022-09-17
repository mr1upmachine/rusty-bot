import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import * as url from 'url';

/** Current directory */
const CURRENT_DIR = url.fileURLToPath(new URL('.', import.meta.url));

/** Relative file path to parse.*/
const FILE_PATH = '../lists/activity-messages.txt';

/** File path to output to */
const OUTPUT_PATH = '../dist/assets/activity-messages.json';

/** @type {[string, number][]} */
const ACTIVITY_STRING_ENUM_MAP = [
  ['Playing', 0],
  ['Listening to', 2],
  ['Watching', 3],
  ['Competing in', 5]
];

/** @type {string} */
const FILE_CONTENTS = readFileSync(path.join(CURRENT_DIR, FILE_PATH), {
  encoding: 'utf-8'
});

/** @type {string[]} */
const ACTIVITY_MESSAGES = FILE_CONTENTS.split('\n')
  .map((message) => message.trim())
  .filter((message) => !message.startsWith('//'))
  .filter((message) => message);

/** @type {([number, string] | null)[]} */
const VALUES = ACTIVITY_MESSAGES.map((message) => {
  for (const [activityText, activityEnum] of ACTIVITY_STRING_ENUM_MAP) {
    if (!message.startsWith(activityText)) {
      continue;
    }

    const newMessage = message.substring(activityText.length + 1);
    return [activityEnum, newMessage];
  }

  return null;
});

/** @type {[number, string][]} */
const FILTERED_VALUES = VALUES.filter((value) => value !== null);

/** @type {string} */
const OUTPUT_JSON = JSON.stringify({
  values: FILTERED_VALUES
});

writeFileSync(path.join(CURRENT_DIR, OUTPUT_PATH), OUTPUT_JSON, {
  encoding: 'utf-8'
});
