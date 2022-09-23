import type {
  MessageReaction,
  PartialMessageReaction,
  User,
  PartialUser
} from 'discord.js';

import { processMessageReactionEvent } from '../utilities/process-message-reaction-event.js';
import { ClientEvent } from '../types/client-event.js';

export class MessageReactionRemoveEvent extends ClientEvent<'messageReactionRemove'> {
  async execute(
    reaction: MessageReaction | PartialMessageReaction,
    user: User | PartialUser
  ): Promise<void> {
    await processMessageReactionEvent(reaction, user, -1);
  }
}

export default MessageReactionRemoveEvent;
