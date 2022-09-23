import type { ClientEvents } from 'discord.js';

import { CLIENT_EVENT_TYPES } from './constants.js';

export function isClientEventString(str: string): str is keyof ClientEvents {
  // This type is technically incorrect but I need to cast it to actually do the check.
  return CLIENT_EVENT_TYPES.includes(str as keyof ClientEvents);
}
