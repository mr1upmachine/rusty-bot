import {
  ColorResolvable,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Guild,
  GuildMember,
  SlashCommandBuilder
} from 'discord.js';
import { Command } from '../../utilities/command';

export default class InfoCommand extends Command {
  async build() {
    return new SlashCommandBuilder()
      .setName('info')
      .setDescription('Displays information about a user.')
      .addUserOption((option) =>
        option.setName('user').setDescription('User to display info for')
      );
  }

  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild as Guild;
    let member = interaction.member as GuildMember;
    let user = interaction.options.getUser('user');

    if (!user) {
      user = interaction.user;
      member = guild.members.cache.get(user.id)!;
    }

    const profilePictureUrl = user.displayAvatarURL();
    const memberNickname = member.nickname || member.user.username;
    const userFirestoreRef = this.firestore
      .collection('guilds')
      .doc(guild.id)
      .collection('members')
      .doc(member.id);

    let about =
      'This is a default about section! Use the profile command to edit it!';
    let postCount = 0;
    let karma = 0;
    let color: ColorResolvable = '#1B9403';

    try {
      const doc = await userFirestoreRef.get();

      if (!doc.exists) {
        interaction.reply('Error retrieving user!');
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

      const embed = this.embedBuilder(
        profilePictureUrl,
        memberNickname,
        about,
        postCount,
        karma,
        color
      );

      interaction.reply({
        embeds: [embed]
      });
    } catch (err) {
      interaction.reply('Error retrieving user.');
      throw err;
    }
  }

  private embedBuilder(
    pfp: string,
    userNickname: string,
    about: string,
    postCount: string | number,
    karma: string | number,
    userColor: ColorResolvable
  ): EmbedBuilder {
    return new EmbedBuilder()
      .setTitle('About')
      .setDescription(about)
      .setTimestamp(new Date())
      .setAuthor({ name: userNickname, iconURL: pfp })
      .setColor(userColor)
      .setFooter({
        text: 'Use the `profile` command for customization!'
      })
      .setThumbnail(pfp)
      .addFields([
        {
          inline: true,
          name: 'Post Count',
          value: `${postCount}`
        },
        {
          inline: true,
          name: 'Karma',
          value: `${karma}`
        }
      ]);
  }
}
