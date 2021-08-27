import { Firestore } from '@google-cloud/firestore';
import { Client, ColorResolvable, Message, MessageEmbed } from 'discord.js';

exports.run = async (client: Client, msg: Message, args: string[], firestore: Firestore) => {
  let pfp = msg.author!.displayAvatarURL();
  let userNickname = msg.author!.username;
  let userRef = firestore.collection('guilds').doc(msg.guild!.id).collection('members').doc(msg.member!.id);

  const mentionedUser = msg.mentions.users.first();
  if (mentionedUser) {
    const member = msg.guild!.members.cache.get(mentionedUser.id);
    if (member) {
      pfp = member.user.displayAvatarURL();
      userNickname = member.user.username;
      userRef = firestore.collection('guilds').doc(msg.guild!.id).collection('members').doc(member.id);
    }
  }

  let about = 'This is a default about section! Use the profile command to edit it!';
  let postCount = 0;
  let karma = 0;
  let color: ColorResolvable = '#1B9403';

  try {
    const doc = await userRef.get();

    if (!doc.exists) {
      msg.channel.send('Error retrieving user!');
      return;
    }

    if (doc.data()?.about) {
      about = doc.data()!.about;
    }
    if (doc.data()?.infoColor) {
      color = doc.data()!.infoColor as ColorResolvable;
    }
    if (doc.data()?.posts || doc.data()?.posts === 0) {
      postCount = doc.data()!.posts;
    }
    if (doc.data()?.karma || doc.data()?.karma === 0) {
      karma = doc.data()!.karma;
    }

    embedBuilder(msg, pfp, userNickname, about, postCount, karma, color);
  } catch (err) {
    msg.channel.send('Error retrieving user.');
  }
};

function embedBuilder(
  msg: Message,
  pfp: string,
  userNickname: string,
  about: string,
  postCount: string | number,
  karma: string | number,
  userColor: ColorResolvable
) {
  try {
    const embed = new MessageEmbed({
      title: 'About',
      description: about,
      color: userColor,
      timestamp: new Date(),
      footer: {
        text: 'Use the `profile` command for customization!'
      },
      thumbnail: {
        url: pfp
      },
      author: {
        icon_url: pfp,
        name: userNickname
      },
      fields: [
        {
          inline: true,
          name: 'Post Count',
          value: `${postCount}`
        },
        {
          inline: true,
          name: 'Meme Karma',
          value: `${karma}`
        }
      ]
    });
    msg.channel.send({
      embeds: [embed] 
    });
  } catch (e) {
    console.log(e);
  }
}

exports.help = {
  description: 'Displays information about a user.',
  name: 'Info',
  usage: 'info [user]'
};

// Items needed for embed:
// User picture, about section, color, post count, meme karma
