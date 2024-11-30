import type { ChatInputCommandInteraction, ColorResolvable } from 'discord.js';
import { EmbedBuilder } from 'discord.js';

import { Command } from '../../types/command.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';
import { useGuildMembersRepository } from '../../db/use-guild-members-repository.js';

const DEFAULT_ABOUT_TEXT =
  'This is a default about section! Use the profile command to edit it!';

class ProfileCommand extends Command {
  public readonly description = 'Displays information about a user.';

  override build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder.addUserOption((option) =>
      option.setName('user').setDescription('User to display info for')
    );
  }

  async execute(
    interaction: ChatInputCommandInteraction<'cached'>
  ): Promise<void> {
    await interaction.deferReply();

    const guild = interaction.guild;

    // Get dependencies
    const guildMembersRepository = useGuildMembersRepository(guild.id);

    // Get arguments
    const user = interaction.options.getUser('user') ?? interaction.user;

    // Fetch member information
    const member = await guild.members.fetch({ user });
    const profilePictureUrl = member.displayAvatarURL();
    const memberNickname = member.nickname ?? user.username;

    // Get member object from db
    const dbMember = await guildMembersRepository.findById(member.id);
    if (!dbMember) {
      await interaction.editReply('No user found!');
      return;
    }

    // Parse info from the db
    const about = dbMember.aboutText ?? dbMember.about ?? DEFAULT_ABOUT_TEXT;
    const color: ColorResolvable | null =
      (dbMember.color as ColorResolvable | undefined) ??
      (dbMember.infoColor as ColorResolvable | undefined) ??
      null;
    const postCount = dbMember.posts ?? 0;
    const karma = dbMember.karma ?? 0;

    // Create embed
    const embed = new EmbedBuilder()
      .setTitle('About')
      .setDescription(about)
      .setTimestamp(new Date())
      .setAuthor({ name: memberNickname, iconURL: profilePictureUrl })
      .setColor(color)
      .setFooter({
        text: 'Use the `edit-profile` command for customization!'
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

    // Respond to user
    await interaction.editReply({
      embeds: [embed]
    });
  }
}

export default ProfileCommand;
