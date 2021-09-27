import { FieldValue, Firestore } from '@google-cloud/firestore';
import { GuildMember, Message, User } from 'discord.js';
import {
  getChannelFirestoreReferenceFromMessage,
  getMemberFirestoreReferenceFromGuildMember,
  getMemberFirestoreReferenceFromUser,
  getMessageFirestoreReferenceFromMessage
} from './firestore-helper';

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

  getChannelFirestoreReferenceFromMessage(firestore, message)
    .get()
    .then((doc) => {
      if (!doc.data()?.meme) {
        return; // Channel is not enabled for tracking
      }

      getMemberFirestoreReferenceFromUser(
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
      messageRef.set(
        { reactionCount: FieldValue.increment(reactionValue) },
        { merge: true }
      );

      messageRef
        .get()
        .then((doc) => {
          const storedData = doc.data();
          if (!storedData?.member) {
            messageRef.set(
              {
                member: message.author.id
              },
              { merge: true }
            );
          }
          if (
            !storedData?.content ||
            message.cleanContent !== storedData?.content
          ) {
            messageRef.set(
              {
                content: message.cleanContent
              },
              { merge: true }
            );
          }
          const messageAttachment = message.attachments.first();
          if (messageAttachment) {
            if (
              !storedData?.attachment ||
              messageAttachment !== storedData?.attachment
            ) {
              messageRef.set(
                {
                  attachment: messageAttachment
                },
                { merge: true }
              );
            }
          }
        })
        .catch((err) => {
          message.channel.send(
            'Error retrieving message from Firestore (processReactionEvent): ' +
              err
          );
        });
    })
    .catch((err) => {
      message.channel.send(
        'Error retrieving channel from Firestore (processReactionEvent): ' + err
      );
    });
}

export async function processMessageEvent(
  message: Message,
  firestore: Firestore,
  messageValue: 1 | -1
) {
  if (message.author.bot) {
    return;
  }
  if (message.guildId) {
    getMemberFirestoreReferenceFromUser(
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
) {
  if (newMember.user.bot || newMember.displayName === oldMember.displayName) {
    return;
  }

  getMemberFirestoreReferenceFromGuildMember(firestore, newMember).set(
    {
      name: newMember.displayName
    },
    { merge: true }
  );
}
