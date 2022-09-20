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
const DEFAULT_PROFILE_COLOR = '#1B9403';

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

    const guild = interaction.guild!;

    // Get dependencies
    const guildMembersRepository = useGuildMembersRepository(guild.id);

    // Get options
    const user = interaction.options.getUser('user') ?? interaction.user;

    const member = guild.members.cache.get(user.id)!;

    const profilePictureUrl = user.displayAvatarURL();
    const memberNickname = member.nickname ?? member.user.username;

    // Get member object from db
    const dbMember = await guildMembersRepository.findById(member.id);
    if (!dbMember) {
      await interaction.editReply('No user found!');
      return;
    }

    const about = dbMember.about ?? DEFAULT_ABOUT_TEXT;
    const color: ColorResolvable =
      (dbMember.infoColor as ColorResolvable | undefined) ??
      DEFAULT_PROFILE_COLOR;
    const postCount = dbMember.posts ?? 0;
    const karma = dbMember.karma ?? 0;

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
  }
}
