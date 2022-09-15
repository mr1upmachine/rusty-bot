import { readFileSync } from 'fs';
import * as path from 'path';
import * as url from 'url';

/**
 * Current directory
 */
const CURRENT_DIR = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Relative file path to parse.
 */
const FILE_PATH = '../src/assets/activity-messages.txt';

/**
 * List of filter conditions to vlidate when parsing the file. If the result
 * is false, it will remove the line.
 *
 * @type {readonly [(str: string) => boolean]}
 */
const FILTERS = [(str) => !str.startsWith('//'), (str) => str.trim() !== ''];

/**
 * List of activity type prefixes to validate.
 *
 * @type {readonly string[]}
 */
const ACTIVITY_TYPES = ['Playing', 'Listening to', 'Watching', 'Competing in'];

/**
 * List of validation functions to run against all lines in the file. If the
 * result is false, it will throw an error.
 *
 * @type {readonly [(str: string) => boolean]}
 */
const VALIDATORS = [
  (str) => str.length < 100,
  (str) =>
    ACTIVITY_TYPES.some((activityType) => str.startsWith(`${activityType} `))
];

/**
 * Get all messages from the file path & filter unnecessary ones.
 *
 * @type {string[]}
 */
const messages = readFileSync(path.join(CURRENT_DIR, FILE_PATH))
  .toString()
  .split('\n')
  .filter((message) => FILTERS.every((filter) => filter(message)));

/**
 * Gets list of errors based on validators.
 *
 * @type {string[]}
 */
const errors = messages.reduce(
  (errorList, message) =>
    VALIDATORS.every((validator) => validator(message))
      ? errorList
      : [...errorList, `"${message}" is not in a valid format.`],
  []
);

// If no errors, exit successfully.
if (errors.length === 0) {
  process.exit(0);
}

// Log all errors and exit unsuccessfully.
errors.forEach((e) => console.error(e));
process.exit(1);
