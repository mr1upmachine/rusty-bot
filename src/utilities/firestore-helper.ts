import type { Firestore, DocumentReference } from '@google-cloud/firestore';
import type {
  Guild,
  GuildMember,
  GuildTextBasedChannel,
  VoiceBasedChannel,
  Message
} from 'discord.js';

export function getGuildFirestoreReference(
  firestore: Firestore,
  guild: Guild
): DocumentReference {
  return firestore.collection('guilds').doc(guild.id);
}

export function getChannelFirestoreReference(
  firestore: Firestore,
  channel: GuildTextBasedChannel | VoiceBasedChannel
): DocumentReference {
  return getGuildFirestoreReference(firestore, channel.guild)
    .collection('channels')
    .doc(channel.id);
}

export function getMessageFirestoreReference(
  firestore: Firestore,
  message: Message<true>
): DocumentReference {
  return getChannelFirestoreReference(firestore, message.channel)
    .collection('messages')
    .doc(message.id);
}

export function getMemberFirestoreReference(
  firestore: Firestore,
  member: GuildMember
): DocumentReference {
  return getGuildFirestoreReference(firestore, member.guild)
    .collection('members')
    .doc(member.id);
}
