import { pathToFileURL } from 'node:url';

import { hasProperty } from './has-property.js';
import { isArray } from './is-array.js';

const FILE_PATH = 'dist/assets/voice-channel-names.json';

interface VoiceChannelNameJSON {
  groups: readonly VoiceChannelNameGroup[];
}

interface VoiceChannelNameGroup {
  title?: string;
  authors?: string[];
  shuffle?: boolean;
  names: readonly string[];
}

export async function getRandomVoiceChannelNamesFromFile(): Promise<VoiceChannelNameJSON> {
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
    !isValidVoiceChannelNamesStructure(fileContents.default)
  ) {
    throw new Error('voice-channel-names.json is not in a valid structure');
  }

  return fileContents.default;
}

function isValidVoiceChannelNamesStructure(
  struct: object
): struct is VoiceChannelNameJSON {
  if (!hasProperty(struct, 'groups')) {
    return false;
  }

  if (!isArray(struct.groups)) {
    return false;
  }

  const namesPropValid = struct.groups.every(
    (group) =>
      typeof group === 'object' &&
      group !== null &&
      hasProperty(group, 'names') &&
      isArray(group.names) &&
      group.names.every((name) => typeof name === 'string') &&
      (hasProperty(group, 'title') ? typeof group.title === 'string' : true) &&
      (hasProperty(group, 'authors') ? isArray(group.authors) : true) &&
      (hasProperty(group, 'shuffle')
        ? typeof group.shuffle === 'boolean'
        : true)
  );

  return namesPropValid;
}
