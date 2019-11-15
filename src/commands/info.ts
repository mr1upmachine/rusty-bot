import { Firestore } from '@google-cloud/firestore';
import { Client, Message } from 'discord.js';

exports.run = async (client: Client, msg: Message, args: string[], firestore: Firestore) => {
  let pfp = msg.author!.displayAvatarURL();
  let userNick = msg.author!.username;
  let userRef = firestore
    .collection('guilds')
    .doc(msg.guild!.id)
    .collection('members')
    .doc(msg.member!.id);

  const mention = msg.mentions.users.first();
  if (mention) {
    const member = msg.guild!.member(mention);
    if (member) {
      pfp = member.user.displayAvatarURL();
      userNick = member.user.username;
      userRef = firestore
        .collection('guilds')
        .doc(msg.guild!.id)
        .collection('members')
        .doc(member.id);
    }
  }

  let about = 'This is a default about section! Use the profile command to edit it!';
  let postCount = 0;
  let karma = 0;
  let color = '#1B9403';

  userRef
    .get()
    .then(doc => {
      if (!doc.exists) {
        msg.channel.send('Error retrieving user!');
        return;
      }

      if (doc.data()!.about) {
        about = doc.data()!.about;
      }
      if (doc.data()!.infoColor) {
        color = doc.data()!.infoColor;
      }
      if (doc.data()!.posts || doc.data()!.posts === 0) {
        postCount = doc.data()!.posts;
      }
      if (doc.data()!.karma || doc.data()!.karma === 0) {
        karma = doc.data()!.karma;
      }

      embedBuilder(msg, pfp, userNick, about, postCount, karma, color);
    })
    .catch(err => {
      msg.channel.send('Error retrieving user: ', err);
    });
};

function embedBuilder(
  msg: Message,
  pfp: string,
  userNick: string,
  about: string,
  postCount: number,
  karma: number,
  userColor: string,
) {
  try {
    msg.channel.send({
      embed: {
        title: 'About',
        // tslint:disable-next-line: object-literal-sort-keys
        description: about,
        color: userColor,
        timestamp: new Date(),
        footer: {
          text: 'Use the `profile` command for customization!',
        },
        thumbnail: {
          url: pfp,
        },
        author: {
          icon_url: pfp,
          name: userNick,
        },
        fields: [
          {
            inline: true,
            name: 'Post Count',
            value: postCount,
          },
          {
            inline: true,
            name: 'Meme Karma',
            value: karma,
          },
        ],
      },
    });
  } catch (e) {
    console.log(e);
  }
}

exports.help = {
  description: 'Displays information about a user.',
  name: 'Info',
  usage: 'info [user]',
};

// Items needed for embed:
// User picture, about section, color, post count, meme karma
