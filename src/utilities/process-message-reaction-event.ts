import type {
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User
} from 'discord.js';

import { processReactionEvent } from './statistics.js';

export async function processMessageReactionEvent(
  partialMessageReaction: MessageReaction | PartialMessageReaction,
  partialUser: User | PartialUser,
  modifier: 1 | -1
) {
  // fetch and cache partial users
  const user = partialUser.partial ? await partialUser.fetch() : partialUser;

  // Prevent Rusty from responding to and logging other bots
  if (user.bot) {
    return;
  }

  // fetch and cache partial messages
  const { message: partialMessage } = partialMessageReaction.partial
    ? await partialMessageReaction.fetch()
    : partialMessageReaction;
  const message = partialMessage.partial
    ? await partialMessage.fetch()
    : partialMessage;

  // Throw away reaction if not in a guild
  if (!message.inGuild()) {
    return;
  }

  await processReactionEvent(message, user, modifier);
}
