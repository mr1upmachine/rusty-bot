import type { ClientEvents } from 'discord.js';

export const CLIENT_EVENT_TYPES: readonly (keyof ClientEvents)[] = [
  'applicationCommandPermissionsUpdate',
  'cacheSweep',
  'channelCreate',
  'channelDelete',
  'channelPinsUpdate',
  'channelUpdate',
  'debug',
  'warn',
  'emojiCreate',
  'emojiDelete',
  'emojiUpdate',
  'error',
  'guildBanAdd',
  'guildBanRemove',
  'guildCreate',
  'guildDelete',
  'guildUnavailable',
  'guildIntegrationsUpdate',
  'guildMemberAdd',
  'guildMemberAvailable',
  'guildMemberRemove',
  'guildMembersChunk',
  'guildMemberUpdate',
  'guildUpdate',
  'inviteCreate',
  'inviteDelete',
  'messageCreate',
  'messageDelete',
  'messageReactionRemoveAll',
  'messageReactionRemoveEmoji',
  'messageDeleteBulk',
  'messageReactionAdd',
  'messageReactionRemove',
  'messageUpdate',
  'presenceUpdate',
  'ready',
  'invalidated',
  'roleCreate',
  'roleDelete',
  'roleUpdate',
  'threadCreate',
  'threadDelete',
  'threadListSync',
  'threadMemberUpdate',
  'threadMembersUpdate',
  'threadUpdate',
  'typingStart',
  'userUpdate',
  'voiceStateUpdate',
  'webhookUpdate',
  'interactionCreate',
  'shardDisconnect',
  'shardError',
  'shardReady',
  'shardReconnecting',
  'shardResume',
  'stageInstanceCreate',
  'stageInstanceUpdate',
  'stageInstanceDelete',
  'stickerCreate',
  'stickerDelete',
  'stickerUpdate',
  'guildScheduledEventCreate',
  'guildScheduledEventUpdate',
  'guildScheduledEventDelete',
  'guildScheduledEventUserAdd',
  'guildScheduledEventUserRemove'
];
