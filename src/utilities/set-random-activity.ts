import * as path from 'path';
import * as url from 'url';
import { ActivityType } from 'discord.js';
import type { Client } from 'discord.js';
import { readFileSync } from 'fs';

import { RustyBotCommandError } from '../errors/rusty-bot-errors.js';

type SupportedActivityType =
  | ActivityType.Competing
  | ActivityType.Listening
  | ActivityType.Playing
  | ActivityType.Watching;

enum ActivityTypeText {
  Competing = 'Competing in',
  Listening = 'Listening to',
  Playing = 'Playing',
  Watching = 'Watching'
}

type ActivityTypeTextMapEntry = [ActivityTypeText, SupportedActivityType];
type NullableActivityTypeTextMapEntry = [
  ActivityTypeText | null,
  SupportedActivityType | null
];

const ACTIVITY_TYPE_TEXT_MAP: readonly ActivityTypeTextMapEntry[] = [
  [ActivityTypeText.Competing, ActivityType.Competing],
  [ActivityTypeText.Listening, ActivityType.Listening],
  [ActivityTypeText.Playing, ActivityType.Playing],
  [ActivityTypeText.Watching, ActivityType.Watching]
];

/**
 * Current directory
 */
const CURRENT_DIR = url.fileURLToPath(new URL('.', import.meta.url));

/**
 * Relative file path to parse.
 */
const FILE_PATH = '../assets/activity-messages.txt';

/**
 * List of filter conditions when parsing the file. If the result of the
 * function is false, it will remove the line.
 */
const FILTERS: readonly ((str: string) => boolean)[] = [
  (str) => !str.startsWith('//'),
  (str) => str.trim() !== ''
];

export function setRandomActivity(client: Client<true>): void {
  const { user } = client;
  // TODO Do this step at build time instead of runtime
  // Perhaps a script that converts it to a json format and is imported?
  // TODO port generic filter functionality from validator to here
  const messages = readFileSync(path.join(CURRENT_DIR, FILE_PATH))
    .toString()
    .split('\n')
    .filter((message) => FILTERS.every((filter) => filter(message)));

  const randomIndex = Math.floor(Math.random() * messages.length);
  const randomMessage = messages[randomIndex];

  const [activityTypeText, activityType]: NullableActivityTypeTextMapEntry =
    ACTIVITY_TYPE_TEXT_MAP.find(([text]) => randomMessage.startsWith(text)) ?? [
      null,
      null
    ];

  if (activityTypeText === null || activityType === null) {
    throw new RustyBotCommandError(
      'Uh oh, something went very wrong. Contact an admin.',
      `setRandomActivity: Either activityTypeText or activityType does not exist`
    );
  }

  const formattedRandomMessage = randomMessage.substring(
    activityTypeText.length + 1
  );

  user.setActivity(formattedRandomMessage, { type: activityType });
}
