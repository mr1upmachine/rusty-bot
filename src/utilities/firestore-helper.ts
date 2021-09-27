import { GuildMember, Interaction, Message, User } from 'discord.js';
import { Firestore } from '@google-cloud/firestore';

export function getGuildFirestoreReference(
  firestore: Firestore,
  guildId: string
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return firestore.collection('guilds').doc(guildId);
}

export function getGuildFirestoreReferenceFromMessage(
  firestore: Firestore,
  message: Message
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  if (message.guildId) {
    return getGuildFirestoreReference(firestore, message.guildId);
  } else {
    throw new Error('Unable to retrieve guildId from message');
  }
}

export function getGuildFirestoreReferenceFromInteraction(
  firestore: Firestore,
  interaction: Interaction
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  if (interaction.guildId) {
    return getGuildFirestoreReference(firestore, interaction.guildId);
  } else {
    throw new Error('Unable to retrieve guildId from interaction');
  }
}

export function getChannelFirestoreReference(
  firestore: Firestore,
  guildId: string,
  channelId: string
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return getGuildFirestoreReference(firestore, guildId)
    .collection('channels')
    .doc(channelId);
}

export function getChannelFirestoreReferenceFromMessage(
  firestore: Firestore,
  message: Message
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  if (message.guildId) {
    return getChannelFirestoreReference(
      firestore,
      message.guildId,
      message.channelId
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
      firestore,
      interaction.guildId,
      interaction.channelId
    );
  } else {
    throw new Error(
      'Unable to retrieve guildId and/or channelId from interaction'
    );
  }
}

export function getMessageFirestoreReference(
  firestore: Firestore,
  guildId: string,
  channelId: string,
  messageId: string
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return getChannelFirestoreReference(firestore, guildId, channelId)
    .collection('messages')
    .doc(messageId);
}

export function getMessageFirestoreReferenceFromMessage(
  firestore: Firestore,
  message: Message
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  if (message.guildId) {
    return getMessageFirestoreReference(
      firestore,
      message.guildId,
      message.channelId,
      message.id
    );
  } else {
    throw new Error('Unable to retrieve guildId from message');
  }
}

export function getMemberFirestoreReference(
  firestore: Firestore,
  guildId: string,
  userId: string
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return getGuildFirestoreReference(firestore, guildId)
    .collection('members')
    .doc(userId);
}

export function getMemberFirestoreReferenceFromGuildMember(
  firestore: Firestore,
  member: GuildMember
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return getMemberFirestoreReference(firestore, member.guild.id, member.id);
}

export function getMemberFirestoreReferenceFromUser(
  firestore: Firestore,
  user: User,
  guildId: string
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  return getMemberFirestoreReference(firestore, guildId, user.id);
}

export function getMemberFirestoreReferenceFromInteraction(
  interaction: Interaction,
  firestore: Firestore
): FirebaseFirestore.DocumentReference<FirebaseFirestore.DocumentData> {
  if (interaction.guildId) {
    return getMemberFirestoreReferenceFromUser(
      firestore,
      interaction.user,
      interaction.guildId
    );
  } else {
    throw new Error('Unable to retrieve guildId from interaction');
  }
}
