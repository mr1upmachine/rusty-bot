import type { Firestore, DocumentReference } from '@google-cloud/firestore';
import type { GuildMember, Interaction, Message, User } from 'discord.js';

export function getGuildFirestoreReference(
  firestore: Firestore,
  guildId: string
): DocumentReference {
  return firestore.collection('guilds').doc(guildId);
}

export function getGuildFirestoreReferenceFromMessage(
  firestore: Firestore,
  message: Message
): DocumentReference {
  if (!message.guildId) {
    throw new Error('Unable to retrieve guildId from message');
  }

  return getGuildFirestoreReference(firestore, message.guildId);
}

export function getGuildFirestoreReferenceFromInteraction(
  firestore: Firestore,
  interaction: Interaction
): DocumentReference {
  if (!interaction.guildId) {
    throw new Error('Unable to retrieve guildId from interaction');
  }

  return getGuildFirestoreReference(firestore, interaction.guildId);
}

export function getChannelFirestoreReference(
  firestore: Firestore,
  guildId: string,
  channelId: string
): DocumentReference {
  return getGuildFirestoreReference(firestore, guildId)
    .collection('channels')
    .doc(channelId);
}

export function getChannelFirestoreReferenceFromMessage(
  firestore: Firestore,
  message: Message
): DocumentReference {
  if (!message.guildId) {
    throw new Error('Unable to retrieve guildId from message');
  }

  return getChannelFirestoreReference(
    firestore,
    message.guildId,
    message.channelId
  );
}

export function getChannelFirestoreReferenceFromInteraction(
  firestore: Firestore,
  interaction: Interaction
): DocumentReference {
  if (!interaction.guildId) {
    throw new Error('Unable to retrieve guildId from interaction');
  }
  if (!interaction.channelId) {
    throw new Error('Unable to retrieve channelId from interaction');
  }

  return getChannelFirestoreReference(
    firestore,
    interaction.guildId,
    interaction.channelId
  );
}

export function getMessageFirestoreReference(
  firestore: Firestore,
  guildId: string,
  channelId: string,
  messageId: string
): DocumentReference {
  return getChannelFirestoreReference(firestore, guildId, channelId)
    .collection('messages')
    .doc(messageId);
}

export function getMessageFirestoreReferenceFromMessage(
  firestore: Firestore,
  message: Message
): DocumentReference {
  if (!message.guildId) {
    throw new Error('Unable to retrieve guildId from message');
  }

  return getMessageFirestoreReference(
    firestore,
    message.guildId,
    message.channelId,
    message.id
  );
}

export function getMemberFirestoreReference(
  firestore: Firestore,
  guildId: string,
  userId: string
): DocumentReference {
  return getGuildFirestoreReference(firestore, guildId)
    .collection('members')
    .doc(userId);
}

export function getMemberFirestoreReferenceFromGuildMember(
  firestore: Firestore,
  member: GuildMember
): DocumentReference {
  return getMemberFirestoreReference(firestore, member.guild.id, member.id);
}

export function getMemberFirestoreReferenceFromUser(
  firestore: Firestore,
  user: User,
  guildId: string
): DocumentReference {
  return getMemberFirestoreReference(firestore, guildId, user.id);
}

export function getMemberFirestoreReferenceFromInteraction(
  firestore: Firestore,
  interaction: Interaction
): DocumentReference {
  if (!interaction.guildId) {
    throw new Error('Unable to retrieve guildId from interaction');
  }

  return getMemberFirestoreReferenceFromUser(
    firestore,
    interaction.user,
    interaction.guildId
  );
}
