import { readFileSync, writeFileSync } from 'fs';
import * as path from 'path';
import * as url from 'url';

/** @typedef {{ title?: string; authors?: string[]; names: string[]; }} VoiceChannelNameGroup */

/**
 * Breaks one array into two based on a condition
 *
 * @template T
 * @param {T[]} array
 * @param {(value: T) => boolean} isValid
 * @returns {[T[], T[]]}
 */
function partition(array, isValid) {
  return array.reduce(
    ([pass, fail], elem) => {
      return isValid(elem) ? [[...pass, elem], fail] : [pass, [...fail, elem]];
    },
    [[], []]
  );
}

/** Current directory */
const CURRENT_DIR = url.fileURLToPath(new URL('.', import.meta.url));

/** Relative file path to parse.*/
const FILE_PATH = '../lists/voice-channel-names.txt';

/** File path to output to */
const OUTPUT_PATH = '../dist/assets/voice-channel-names.json';

const COMMENT_PATTERN = '//';
const TITLE_TAG = '@title';
const AUTHOR_TAG = '@author';

/** @type {string} */
const FILE_CONTENTS = readFileSync(path.join(CURRENT_DIR, FILE_PATH), {
  encoding: 'utf-8'
});

/**
 * Parse & filter groups from file
 *
 * @type {string[][]}
 */
const GROUPS = FILE_CONTENTS.split(/[\n]{2,}/gm)
  .map((group) =>
    group
      .split('\n')
      .map((str) => str.trim())
      .filter((str) => str)
  )
  .filter((group) => group.length !== 0)
  .filter((group) => !group.every((str) => str.startsWith(COMMENT_PATTERN)));

/**
 * Convert name groups into proper structure
 *
 * @type {VoiceChannelNameGroup[]}
 */
const FORMATTED_GROUPS = GROUPS.map((group) => {
  // Get all names
  const [names, comments] = partition(
    group,
    (str) => !str.startsWith(COMMENT_PATTERN)
  );
  const meta = comments.map((str) =>
    str.substring(COMMENT_PATTERN.length).trim()
  );

  // get title if it exists
  const title = meta
    .find((str) => str.startsWith(TITLE_TAG))
    ?.substring(TITLE_TAG.length)
    .trim();

  // get authors if it exists
  const authors = meta
    .filter((str) => str.startsWith(AUTHOR_TAG))
    .map((str) => str.substring(AUTHOR_TAG.length).trim());

  return { title, authors, names };
});

/** @type {string} */
const OUTPUT_JSON = JSON.stringify({
  groups: FORMATTED_GROUPS
});

writeFileSync(path.join(CURRENT_DIR, OUTPUT_PATH), OUTPUT_JSON, {
  encoding: 'utf-8'
});
