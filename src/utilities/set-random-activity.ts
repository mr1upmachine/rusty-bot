import * as path from 'path';
import * as url from 'url';
import { ActivityType } from 'discord.js';
import type { Client } from 'discord.js';
import { readFileSync } from 'fs';

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

const ACTIVITY_TYPE_TEXT_MAP: readonly [
  ActivityTypeText,
  SupportedActivityType
][] = [
  [ActivityTypeText.Competing, ActivityType.Competing],
  [ActivityTypeText.Listening, ActivityType.Listening],
  [ActivityTypeText.Playing, ActivityType.Playing],
  [ActivityTypeText.Watching, ActivityType.Watching]
];

/**
 * Current directory
 */
const CURRENT_DIR = url.fileURLToPath(new URL('.', import.meta.url));

export function setRandomActivity({ user }: Client): void {
  if (!user) {
    throw new Error('Client user does not exist on client.');
  }

  // TODO Do this step at build time instead of runtime
  // Perhaps a script that converts it to a json format and is imported?
  // TODO port generic filter functionality from validator to here
  const messages = readFileSync(
    path.join(CURRENT_DIR, '../assets/activity-messages.txt')
  )
    .toString()
    .split('\n')
    .filter((message) => !message.startsWith('//'))
    .filter((message) => message.trim() !== '');

  const randomIndex = Math.floor(Math.random() * messages.length);
  const randomMessage = messages[randomIndex];

  const [activityTypeText, activityType]: [
    ActivityTypeText | null,
    SupportedActivityType | null
  ] = ACTIVITY_TYPE_TEXT_MAP.find(([text]) =>
    randomMessage.startsWith(text)
  ) ?? [null, null];

  if (!activityTypeText || !activityType) {
    throw new Error(
      'Somehow activityTypeText or activityType does not exist. This should not happen.'
    );
  }

  const formattedRandomMessage = randomMessage.substring(
    activityTypeText.length + 1
  );

  user.setActivity(formattedRandomMessage, { type: activityType });
}
