import type { ChatInputCommandInteraction, ColorResolvable } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

import { Command } from '../../types/command.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';
import { getMemberFirestoreReference } from '../../utilities/firestore-helper.js';

export class ProfileCommand extends Command {
  public readonly name = 'profile';
  public readonly description = 'Displays information about a user.';

  override build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder.addUserOption((option) =>
      option.setName('user').setDescription('User to display info for')
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply();

    const user = interaction.options.getUser('user') ?? interaction.user;

    const guild = interaction.guild!;
    const member = guild.members.cache.get(user.id)!;

    const profilePictureUrl = user.displayAvatarURL();
    const memberNickname = member.nickname ?? member.user.username;
    const userFirestoreRef = getMemberFirestoreReference(
      this.firestore,
      member
    );

    let about =
      'This is a default about section! Use the profile command to edit it!';
    let postCount = 0;
    let karma = 0;
    let color: ColorResolvable = '#1B9403';

    try {
      const doc = await userFirestoreRef.get();

      if (!doc.exists) {
        await interaction.reply('Error retrieving user!');
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

      const embed = new EmbedBuilder()
        .setTitle('About')
        .setDescription(about)
        .setTimestamp(new Date())
        .setAuthor({ name: memberNickname, iconURL: profilePictureUrl })
        .setColor(color)
        .setFooter({
          text: 'Use the `profile` command for customization!'
        })
        .setThumbnail(profilePictureUrl)
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

      await interaction.editReply({
        embeds: [embed]
      });
    } catch (e: unknown) {
      await interaction.editReply('Error retrieving user.');
      throw e;
    }
  }
}
