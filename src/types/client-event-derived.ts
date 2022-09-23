import type { ClientEvents } from 'discord.js';

import type { ClientEvent } from './client-event.js';

export type ClientEventDerived<
  T extends keyof ClientEvents = keyof ClientEvents
> = new (eventName: T) => ClientEvent<T> & typeof ClientEvent;
