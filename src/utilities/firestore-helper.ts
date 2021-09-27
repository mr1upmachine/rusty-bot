import { GuildMember, Interaction, Message, User } from 'discord.js';
import { Firestore } from '@google-cloud/firestore';

export function getGuildFirestoreReference(
  guildId: string,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return firestore.collection('guilds').doc(guildId);
}

export function getGuildFirestoreReferenceFromMessage(
  message: Message,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  if (message.guildId) {
    return getGuildFirestoreReference(message.guildId, firestore);
  } else {
    throw new Error('Unable to retrieve guildId from message');
  }
}

export function getGuildFirestoreReferenceFromInteraction(
  interaction: Interaction,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  if (interaction.guildId) {
    return getGuildFirestoreReference(interaction.guildId, firestore);
  } else {
    throw new Error('Unable to retrieve guildId from interaction');
  }
}

export function getChannelFirestoreReference(
  guildId: string,
  channelId: string,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return getGuildFirestoreReference(guildId, firestore)
    .collection('channels')
    .doc(channelId);
}

export function getChannelFirestoreReferenceFromMessage(
  message: Message,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  if (message.guildId) {
    return getChannelFirestoreReference(
      message.guildId,
      message.channelId,
      firestore
    );
  } else {
    throw new Error('Unable to retrieve guildId from message');
  }
}

export function getChannelFirestoreReferenceFromInteraction(
  interaction: Interaction,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  if (interaction.guildId && interaction.channelId) {
    return getChannelFirestoreReference(
      interaction.guildId,
      interaction.channelId,
      firestore
    );
  } else {
    throw new Error(
      'Unable to retrieve guildId and/or channelId from interaction'
    );
  }
}

export function getMessageFirestoreReference(
  guildId: string,
  channelId: string,
  messageId: string,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return getChannelFirestoreReference(guildId, channelId, firestore)
    .collection('messages')
    .doc(messageId);
}

export function getMessageFirestoreReferenceFromMessage(
  message: Message,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  if (message.guildId) {
    return getMessageFirestoreReference(
      message.guildId,
      message.channelId,
      message.id,
      firestore
    );
  } else {
    throw new Error('Unable to retrieve guildId from message');
  }
}

export function getMemberFirestoreReference(
  guildId: string,
  userId: string,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return getGuildFirestoreReference(guildId, firestore)
    .collection('members')
    .doc(userId);
}

export function getMemberFirestoreReferenceFromGuildMember(
  member: GuildMember,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return getMemberFirestoreReference(member.guild.id, member.id, firestore);
}

export function getMemberFirestoreReferenceFromUser(
  user: User,
  guildId: string,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return getMemberFirestoreReference(guildId, user.id, firestore);
}

export function getMemberFirestoreReferenceFromInteraction(
  interaction: Interaction,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  if (interaction.guildId) {
    return getMemberFirestoreReferenceFromUser(
      interaction.user,
      interaction.guildId,
      firestore
    );
  } else {
    throw new Error('Unable to retrieve guildId from interaction');
  }
}
