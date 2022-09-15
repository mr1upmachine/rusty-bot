import { FieldValue } from '@google-cloud/firestore';
import type { Firestore } from '@google-cloud/firestore';
import type { GuildMember, Message, User } from 'discord.js';

import {
  getGuildFirestoreReference,
  getMemberFirestoreReference,
  getMessageFirestoreReference
} from './firestore-helper.js';

export async function processReactionEvent(
  message: Message<true>,
  reactingUser: User,
  firestore: Firestore,
  reactionValue: 1 | -1
): Promise<void> {
  const { member: cachedMember, author, guild } = message;
  const member = cachedMember ?? (await guild.members.fetch({ user: author }));

  // Toss reaction if by the author or from a bot
  if (member.user.bot || member.user === reactingUser) {
    return;
  }

  const channelDocumentRef = getGuildFirestoreReference(firestore, guild);
  const channelDocument = await channelDocumentRef.get();

  if (!channelDocument.data()?.karmaTracking) {
    if (channelDocument.data()?.meme) {
      // migrate to new field name
      await channelDocumentRef.set(
        { karmaTracking: true, meme: FirebaseFirestore.FieldValue.delete() },
        { merge: true }
      );
    } else {
      return; // Channel is not enabled for tracking
    }
  }

  await getMemberFirestoreReference(firestore, member).set(
    {
      karma: FieldValue.increment(reactionValue)
    },
    { merge: true }
  );

  const messageRef = getMessageFirestoreReference(firestore, message);
  await messageRef.set(
    { reactionCount: FieldValue.increment(reactionValue) },
    { merge: true }
  );

  const messageDocumentData = (await messageRef.get()).data();
  if (!messageDocumentData?.member) {
    await messageRef.set(
      {
        member: member.id
      },
      { merge: true }
    );
  }
  if (
    !messageDocumentData?.content ||
    message.cleanContent !== messageDocumentData.content
  ) {
    await messageRef.set(
      {
        content: message.cleanContent
      },
      { merge: true }
    );
  }

  const messageAttachment = message.attachments.first()?.attachment;
  if (messageAttachment) {
    if (
      !messageDocumentData?.attachment ||
      messageAttachment !== messageDocumentData.attachment
    ) {
      await messageRef.set(
        {
          attachment: messageAttachment
        },
        { merge: true }
      );
    }
  }
}

export async function processMessageEvent(
  message: Message<true>,
  firestore: Firestore,
  messageValue: 1 | -1
): Promise<void> {
  const { member: cachedMember, author, guild } = message;
  const member = cachedMember ?? (await guild.members.fetch({ user: author }));

  await getMemberFirestoreReference(firestore, member).set(
    {
      posts: FieldValue.increment(messageValue)
    },
    { merge: true }
  );
}

export async function processMemberEditEvent(
  oldMember: GuildMember,
  newMember: GuildMember,
  firestore: Firestore
): Promise<void> {
  if (newMember.user.bot || newMember.displayName === oldMember.displayName) {
    return;
  }

  await getMemberFirestoreReference(firestore, newMember).set(
    {
      name: newMember.displayName
    },
    { merge: true }
  );
}
