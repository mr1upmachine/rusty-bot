import { FieldValue, Firestore } from '@google-cloud/firestore';
import { Client, GuildMember, Message, MessageReaction, User } from 'discord.js';

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
  let msgContent = '';
  let msgAttach = '';

  const getChannel = guildRef.collection('channels').doc(msg.channel.id).get()
  .then((doc) => {
    if (!doc.exists) {
      return;
    } else {
      if (doc.data()!.meme) { meme = doc.data()!.meme; }
      if (doc.data()!.content) { msgContent = doc.data()!.content; }
      if (doc.data()!.attachment) { msgAttach = doc.data()!.attachments; }

      if (user !== msgReact.message.author && meme) {
        // Add to user karma
        const userRef = guildRef.collection('members').doc(msg.member!.id);
        const addToMember = userRef.set({
          karma: FieldValue.increment(1),
        }, {merge: true});

        // Add message content
        if (msg.cleanContent !== msgContent || msg.attachments.first()!.url !== msgAttach) {
          const addToMessage = msgRef.set({
            attachment: msg.attachments.first()!.url,
            content: msg.cleanContent,
          }, {merge: true});
        }
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

exports.messageEdit = async (client: Client, oldMsg: Message, newMsg: Message, firestore: Firestore) => {
  const guild = newMsg.guild;
  const guildRef = firestore.collection('guilds').doc(guild!.id);
  let meme = false;
  let content = '';
  let attach = '';

  const getChannel = guildRef.collection('channels').doc(oldMsg.channel.id).get()
  .then((doc) => {
    if (!doc.exists) {
      return;
    } else {
      if (doc.data()!.meme) { meme = doc.data()!.meme; }
      if (doc.data()!.content) { content = doc.data()!.content; }
      if (doc.data()!.attachment) { attach = doc.data()!.attachments; }

      if (meme) {
        const msgRef = guildRef.collection('channels').doc(oldMsg.channel.id).collection('messages').doc(oldMsg.id);
        const addToMessage = msgRef.set({
          attachment: newMsg.attachments.first()!.url,
            content: newMsg.cleanContent,
        }, {merge: true});
      }
    }
  })
  .catch((err) => {
    newMsg.channel.send('Error retrieving channel info: ' + err);
  });
};

exports.memberEdit = async (client: Client, oldMember: GuildMember, newMember: GuildMember, firestore: Firestore) => {
  if (newMember.nickname !== oldMember.nickname) {
    const guildRef = firestore.collection('guilds').doc( newMember.guild!.id);
    const userRef = guildRef.collection('members').doc(newMember!.id);
    const addToMember = userRef.set({
      name: newMember.nickname,
    }, {merge: true});
  }
};

/* Things to track:
Karma:
  [Done] Message Sender id
  [Done?] Message Contents (instantiate on first reaction add, update on edit)
  [Done] Reaction Count

User leaderboard:
  [Done] User ID
  [Done] Karma count
  [Done] Post count
  [Done] About info
  [Doneish] Nickname (currently user setable, not ready for release)
*/
