import type { ActivityType } from 'discord.js';
import { pathToFileURL } from 'node:url';

import { hasProperty } from './has-property.js';
import { isArray } from './is-array.js';

type SupportedActivityType =
  | ActivityType.Competing
  | ActivityType.Listening
  | ActivityType.Playing
  | ActivityType.Watching;

interface ActivityMessagesJSON {
  values: ActivityTypeTextMapEntry[];
}
type ActivityTypeTextMapEntry = [SupportedActivityType, string];

const FILE_PATH = 'dist/assets/activity-messages.json';

export async function getRandomActivitiesFromFile(): Promise<ActivityMessagesJSON> {
  const url = pathToFileURL(FILE_PATH);
  const fileContents: unknown = await import(url.toString(), {
    assert: {
      type: 'json'
    }
  });

  if (
    typeof fileContents !== 'object' ||
    fileContents === null ||
    !hasProperty(fileContents, 'default') ||
    typeof fileContents.default !== 'object' ||
    fileContents.default === null ||
    !isValidActivityMessageStructure(fileContents.default)
  ) {
    throw new Error('activity-messages.json is not in a valid structure');
  }

  return fileContents.default;
}

function isValidActivityMessageStructure(
  struct: object
): struct is ActivityMessagesJSON {
  if (!hasProperty(struct, 'values')) {
    return false;
  }

  if (!Array.isArray(struct.values)) {
    return false;
  }

  return struct.values.every(
    (value) =>
      isArray(value) &&
      typeof value[0] === 'number' &&
      typeof value[1] === 'string'
  );
}
