import type {
  Awaitable,
  MessageReaction,
  PartialMessageReaction,
  PartialUser,
  User
} from 'discord.js';
import type { Firestore } from '@google-cloud/firestore';

import { processReactionEvent } from './utilities/statistics.js';

type MessageReactionEvent = (
  reaction: MessageReaction | PartialMessageReaction,
  user: User | PartialUser
) => Awaitable<void>;

type MessageReactionEventFactory = (
  firestore: Firestore,
  modifier: 1 | -1
) => MessageReactionEvent;

export const messageReactionEventFactory: MessageReactionEventFactory = (
  firestore: Firestore,
  modifier: 1 | -1
) => {
  return async (partialMessageReaction, partialUser) => {
    try {
      // fetch and cache partial users
      const user = partialUser.partial
        ? await partialUser.fetch()
        : partialUser;

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

      await processReactionEvent(message, user, firestore, modifier);
    } catch (e: unknown) {
      console.log('Uncaught exception:');
      console.error(e);
    }
  };
};
