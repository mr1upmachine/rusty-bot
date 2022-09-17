import { FieldValue } from '@google-cloud/firestore';
import type { Firestore } from '@google-cloud/firestore';
import type { GuildMember, Message, User } from 'discord.js';

import {
  getChannelFirestoreReferenceFromMessage,
  getMemberFirestoreReferenceFromGuildMember,
  getMemberFirestoreReferenceFromUser,
  getMessageFirestoreReferenceFromMessage
} from './firestore-helper.js';

export async function processReactionEvent(
  message: Message,
  reactingUser: User,
  firestore: Firestore,
  reactionValue: 1 | -1
): Promise<void> {
  const guild = message.guild;
  const messageAuthor = message.author;

  if (
    !message ||
    !guild ||
    !messageAuthor ||
    messageAuthor.bot ||
    reactingUser === message.author
  ) {
    return;
  }

  const channelDocumentRef = getChannelFirestoreReferenceFromMessage(
    firestore,
    message
  );
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

  await getMemberFirestoreReferenceFromUser(
    firestore,
    message.author,
    guild.id
  ).set(
    {
      karma: FieldValue.increment(reactionValue)
    },
    { merge: true }
  );

  const messageRef = getMessageFirestoreReferenceFromMessage(
    firestore,
    message
  );
  await messageRef.set(
    { reactionCount: FieldValue.increment(reactionValue) },
    { merge: true }
  );

  const messageDocumentData = (await messageRef.get()).data();
  if (!messageDocumentData?.member) {
    await messageRef.set(
      {
        member: message.author.id
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
  message: Message,
  firestore: Firestore,
  messageValue: 1 | -1
): Promise<void> {
  if (message.author.bot) {
    return;
  }
  if (message.guildId) {
    await getMemberFirestoreReferenceFromUser(
      firestore,
      message.author,
      message.guildId
    ).set(
      {
        posts: FieldValue.increment(messageValue)
      },
      { merge: true }
    );
  }
}

export async function processMemberEditEvent(
  oldMember: GuildMember,
  newMember: GuildMember,
  firestore: Firestore
): Promise<void> {
  if (newMember.user.bot || newMember.displayName === oldMember.displayName) {
    return;
  }

  await getMemberFirestoreReferenceFromGuildMember(firestore, newMember).set(
    {
      name: newMember.displayName
    },
    { merge: true }
  );
}
