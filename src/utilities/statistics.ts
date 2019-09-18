import { FieldValue, Firestore } from '@google-cloud/firestore';
import { Client, Message, MessageReaction, User } from 'discord.js';

exports.addReaction = async (client: Client, msgReact: MessageReaction, user: User, firestore: Firestore) => {
  const guild = msgReact.message.guild;
  const msg = msgReact.message;
  const channelRef = firestore.collection('guilds').doc(guild!.id).collection('channels');

  const msgRef = channelRef.doc(msg.channel.id).collection('messages').doc(msg.id);
  const addToReactions = msgRef.set({
    reactionCount: FieldValue.increment(1),
  }, {merge: true});
};

exports.removeReaction = async (client: Client, msgReact: MessageReaction, user: User, firestore: Firestore) => {
  const guild = msgReact.message.guild;
  const msg = msgReact.message;
  const channelRef = firestore.collection('guilds').doc(guild!.id).collection('channels');

  const msgRef = channelRef.doc(msg.channel.id).collection('messages').doc(msg.id);
  const addToReactions = msgRef.set({
    reactionCount: FieldValue.increment(-1),
  }, {merge: true});
};
