import type { Message } from 'discord.js';

import { ClientEvent } from '../types/client-event.js';
import { processMessageEvent } from '../utilities/statistics.js';

export class MessageCreateEvent extends ClientEvent<'messageCreate'> {
  async execute(message: Message): Promise<void> {
    // Prevent Rusty from responding to and logging other bots
    if (message.author.bot) {
      return;
    }

    // Throw away event if not in a guild
    if (!message.inGuild()) {
      return;
    }

    await processMessageEvent(message, 1);
  }
}

export default MessageCreateEvent;
