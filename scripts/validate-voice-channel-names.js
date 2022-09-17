import { readFileSync } from 'fs';
import * as path from 'path';
import * as url from 'url';

/** Current directory */
const CURRENT_DIR = url.fileURLToPath(new URL('.', import.meta.url));

/** Relative file path to parse. */
const FILE_PATH = '../lists/voice-channel-names.txt';

/**
 * List of filter conditions to vlidate when parsing the file. If the result
 * is false, it will remove the line.
 *
 * @type {readonly ((str: string) => boolean)[]}
 */
const FILTERS = [(str) => !str.startsWith('//'), (str) => str.length];

/**
 * List of validation functions to run against all lines in the file. If the
 * result is false, it will throw an error.
 *
 * @type {readonly ((str: string) => boolean)[]}
 */
const VALIDATORS = [(str) => str.length < 100];

// Parse & filter groups from file
const groups = readFileSync(path.join(CURRENT_DIR, FILE_PATH), {
  encoding: 'utf-8'
})
  .split(/[\n]{2,}/gm)
  .map((group) => group.split('\n'))
  .map((group) =>
    group.filter((name) => FILTERS.every((filter) => filter(name)))
  )
  .filter((group) => group.length !== 0);

/**
 * Gets list of errors based on validators.
 *
 * @type {string[]}
 */
const errors = [];
for (const group of groups) {
  for (const name of group) {
    const valid = VALIDATORS.every((validator) => validator(name));

    if (!valid) {
      errors.push(`ERROR: ${name} is not in a valid format.`);
    }
  }
}

// If no errors, exit successfully.
if (errors.length === 0) {
  process.exit(0);
}

// Log all errors and exit unsuccessfully.
errors.forEach((e) => console.error(e));
process.exit(1);
