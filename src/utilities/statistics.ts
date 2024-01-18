import type { GuildMember, Message, User } from 'discord.js';

import type { DBGuildMessage } from '../db/types.js';
import { useGuildChannelsRepository } from '../db/use-guild-channels-repository.js';
import { useGuildMembersRepository } from '../db/use-guild-members-repository.js';
import { useGuildMessagesRepository } from '../db/use-guild-messages-repository.js';

export async function processReactionEvent(
  message: Message<true>,
  reactingUser: User,
  reactionValue: 1 | -1
): Promise<void> {
  const { author, guild, channel } = message;
  const guildId = message.channel.guild.id;
  const channelId = message.channel.id;

  // Get dependencies
  const guildChannelsRepository = useGuildChannelsRepository(guildId);
  const guildMembersRepository = useGuildMembersRepository(guildId);
  const guildMessageRepository = useGuildMessagesRepository(guildId, channelId);

  const member =
    message.member ?? (await guild.members.fetch({ user: author }));

  // Toss reaction if by the author or from a bot
  if (member.user.bot || member.user === reactingUser) {
    return;
  }

  const dbGuildChannel = await guildChannelsRepository.findById(channel.id);

  if (!dbGuildChannel?.karmaTracking) {
    return; // Channel is not enabled for tracking
  }

  const currentDBGuildMessage = await guildMessageRepository.findById(
    message.id
  );
  let newDBGuildMessage: Partial<DBGuildMessage> = {};

  // Update counters in db
  await guildMembersRepository.incrementKarma(member.id, reactionValue);
  await guildMessageRepository.incrementReactionCount(
    message.id,
    reactionValue
  );

  if (!currentDBGuildMessage?.member) {
    newDBGuildMessage = { ...newDBGuildMessage, member: member.id };
  }

  if (
    !currentDBGuildMessage?.content ||
    message.cleanContent !== currentDBGuildMessage.content
  ) {
    newDBGuildMessage = { ...newDBGuildMessage, content: message.cleanContent };
  }

  const messageAttachment = message.attachments.first()?.toString();
  if (
    messageAttachment &&
    (!currentDBGuildMessage?.attachment ||
      messageAttachment !== currentDBGuildMessage.attachment)
  ) {
    newDBGuildMessage = {
      ...newDBGuildMessage,
      attachment: messageAttachment
    };
  }

  await guildMessageRepository.save(message.id, newDBGuildMessage);
}

export async function processMessageEvent(
  message: Message<true>,
  messageValue: 1 | -1
): Promise<void> {
  const { author, guild } = message;
  const guildId = message.channel.guild.id;

  // Get dependencies
  const guildMembersRepository = useGuildMembersRepository(guildId);

  const member =
    message.member ?? (await guild.members.fetch({ user: author }));

  // Update counters in db
  await guildMembersRepository.incrementPosts(member.id, messageValue);
}

export async function processMemberEditEvent(
  oldMember: GuildMember,
  newMember: GuildMember
): Promise<void> {
  if (newMember.user.bot || newMember.displayName === oldMember.displayName) {
    return;
  }

  // Get dependencies
  const guildMembersRepository = useGuildMembersRepository(oldMember.guild.id);

  await guildMembersRepository.save(oldMember.id, {
    name: newMember.displayName
  });
}
