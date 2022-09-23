import type { Awaitable, ClientEvents } from 'discord.js';

export abstract class ClientEvent<K extends keyof ClientEvents> {
  public readonly once: boolean = false;

  constructor(public readonly eventName: K) {}

  abstract execute(...args: ClientEvents[K]): Awaitable<void>;
}
