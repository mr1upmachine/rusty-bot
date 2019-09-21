import { FieldValue, Firestore } from '@google-cloud/firestore';
import { Client, Message, MessageReaction, User } from 'discord.js';

// TODO: Update member post count on deletion? Would require channel and message partials, probably not worth the extra effort
// TODO: Optimize

exports.addReaction = async (client: Client, msgReact: MessageReaction, user: User, firestore: Firestore) => {
  const guild = msgReact.message.guild;
  const msg = msgReact.message;
  const guildRef = firestore.collection('guilds').doc( guild!.id);

  // Add to post count
  const msgRef = guildRef.collection('channels').doc(msg.channel.id).collection('messages').doc(msg.id);
  const addToReactions = msgRef.set({
    reactionCount: FieldValue.increment(1),
  }, {merge: true});

  let meme = false;

  const getChannel = guildRef.collection('channels').doc(msg.channel.id).get()
  .then((doc) => {
    if (!doc.exists) {
      return;
    } else {
      if (doc.data()!.meme) { meme = doc.data()!.meme; }

      if (user !== msgReact.message.author) {
        // Add to user karma
        const userRef = guildRef.collection('members').doc(msg.member!.id);
        const addToMember = userRef.set({
          karma: FieldValue.increment(1),
        }, {merge: true});
      }
    }
  })
  .catch((err) => {
    msg.channel.send('Error retrieving channel info: ' + err);
  });
};

exports.removeReaction = async (client: Client, msgReact: MessageReaction, user: User, firestore: Firestore) => {
  const guild = msgReact.message.guild;
  const msg = msgReact.message;
  const guildRef = firestore.collection('guilds').doc(guild!.id);

  // Remove from post count
  const msgRef = guildRef.collection('channels').doc(msg.channel.id).collection('messages').doc(msg.id);
  const addToReactions = msgRef.set({
    reactionCount: FieldValue.increment(-1),
  }, {merge: true});

  let meme = false;
  const getChannel = guildRef.collection('channels').doc(msg.channel.id).get()
  .then((doc) => {
    if (!doc.exists) {
      return;
    } else {
      if (doc.data()!.meme) { meme = doc.data()!.meme; }

      if (user !== msgReact.message.author && meme) {
        // Remove from user karma
        const userRef = guildRef.collection('members').doc(msg.member!.id);
        const addToMember = userRef.set({
          karma: FieldValue.increment(-1),
        }, {merge: true});
      }
    }
  })
  .catch((err) => {
    msg.channel.send('Error retrieving channel info: ' + err);
  });
};

exports.messageSent = async (client: Client, msg: Message, firestore: Firestore) => {
  const guild = msg.guild;
  const guildRef = firestore.collection('guilds').doc(guild!.id);

  const userRef = guildRef.collection('members').doc(msg.member!.id);
  const addToMember = userRef.set({
    posts: FieldValue.increment(1),
  }, {merge: true});
};
