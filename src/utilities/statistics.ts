import { FieldValue, Firestore } from '@google-cloud/firestore';
import { Client, GuildMember, Message, MessageReaction, User } from 'discord.js';

exports.addReaction = async (client: Client, msgReact: MessageReaction, user: User, firestore: Firestore) => {
  const guild = msgReact.message.guild;
  const msg = msgReact.message;
  const guildRef = firestore.collection('guilds').doc( guild!.id);

  // Prevent bots from affecting stats
  if (msg.author!.bot) {
    return;
  }

  let meme = false;
  let content = '';
  let attach = '';

  // get channel collection from firestore
  const getChannel = guildRef.collection('channels').doc(msg.channel.id).get()
    .then((doc) => {
      if (!doc.exists) {
        return; // Okay to return, meme channels should be set beforehand
      } else {
        if (doc.data()!.meme) { meme = doc.data()!.meme; }

        // prevent users from giving themselves karma, prevent tracking non-meme channels
        if (user !== msgReact.message.author && meme) {

          // Add to post reaction count
          const msgRef = guildRef.collection('channels').doc(msg.channel.id).collection('messages').doc(msg.id);
          const addToReactions = msgRef.set({
            reactionCount: FieldValue.increment(1),
          }, {merge: true});

          // Add to poster karma
          const userRef = guildRef.collection('members').doc(msg.member!.id);
          const addToMember = userRef.set({
            karma: FieldValue.increment(1),
          }, {merge: true});

          // Add message content
          const getMessage = msgRef.get().then((msgDoc) => {

            if (msgDoc.data()) {
              if (msgDoc.data()!.content) { content = msgDoc.data()!.content; }
              if (msgDoc.data()!.attachment) { attach = msgDoc.data()!.attachments; }
            }
            // Prevent constant uploading of the same content
            if (msg.cleanContent !== content || msg.attachments.first()!.url !== attach) {
              if (msg.attachments.first()) {
                const addToMessage = msgRef.set({
                  attachment: msg.attachments.first()!.url,
                  content: msg.cleanContent,
                  member: msg.author!.id,
                }, {merge: true});
              } else {
                const addToMessage = msgRef.set({
                  content: msg.cleanContent,
                  member: msg.author!.id,
                }, {merge: true});
              }
            }
          })
          .catch((err) => {
            msg.channel.send('Error in statistics.addReaction (getMessage): ' + err);
          });
          }
        }
      })
    .catch((err) => {
      msg.channel.send('Error in statistics.addReaction: ' + err);
    });
};

exports.removeReaction = async (client: Client, msgReact: MessageReaction, user: User, firestore: Firestore) => {
  const guild = msgReact.message.guild;
  const msg = msgReact.message;
  const guildRef = firestore.collection('guilds').doc(guild!.id);
  let meme = false;

  // Prevent bots from affecting stats
  if (msg.author!.bot) {
    return;
  }

  const getChannel = guildRef.collection('channels').doc(msg.channel.id).get()
  .then((doc) => {
    if (!doc.exists) {
      return;
    } else {
      if (doc.data()) {
        if (doc.data()!.meme) { meme = doc.data()!.meme; }
      }

      if (user !== msgReact.message.author && meme) {
        // Remove from post count
        const msgRef = guildRef.collection('channels').doc(msg.channel.id).collection('messages').doc(msg.id);
        const addToReactions = msgRef.set({
          reactionCount: FieldValue.increment(-1),
        }, {merge: true});

        // Remove from user karma
        const userRef = guildRef.collection('members').doc(msg.member!.id);
        const addToMember = userRef.set({
          karma: FieldValue.increment(-1),
        }, {merge: true});
      }
    }
  })
  .catch((err) => {
    msg.channel.send('Error in statistics.removeReaction: ' + err);
  });
};

exports.messageSent = async (client: Client, msg: Message, firestore: Firestore) => {
  const guild = msg.guild;
  const guildRef = firestore.collection('guilds').doc(guild!.id);
  const userRef = guildRef.collection('members').doc(msg.member!.id);

  // Prevent bots from affecting stats
  if (msg.author!.bot) {
    return;
  }

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

  // Prevent bots from affecting stats
  if (newMsg.author!.bot) {
    return;
  }

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
        if (newMsg.attachments.first()) {
          const addToMessage = msgRef.set({
            attachment: newMsg.attachments.first()!.url,
            content: newMsg.cleanContent,
          }, {merge: true});
        } else {
          const addToMessage = msgRef.set({
            content: newMsg.cleanContent,
          }, {merge: true});
        }
      }
    }
  })
  .catch((err) => {
    newMsg.channel.send('Error in statistics.messageEdit: ' + err);
  });
};

exports.memberEdit = async (client: Client, oldMember: GuildMember, newMember: GuildMember, firestore: Firestore) => {

  // Prevent bots from affecting stats
  if (newMember.user.bot) {
    return;
  }

  // Return if name/nickname hasn't changed
  if (newMember.displayName === oldMember.displayName) {
    return;
  }

  // Update saved name in firestore
  const userRef = firestore.collection('guilds').doc( newMember.guild!.id).collection('members').doc(newMember!.id);
  const addToMember = userRef.set({
      name: newMember.displayName,
    }, {merge: true});
};
