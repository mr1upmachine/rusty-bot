import type { RandomVoiceChannelNamesCronMeta } from '../types/random-voice-channel-names-cron-meta.js';

const randomVoiceChannelNameCronMap = new Map<
  string,
  RandomVoiceChannelNamesCronMeta
>();

export function useRandomVoiceChannelNameCronMap(): Map<
  string,
  RandomVoiceChannelNamesCronMeta
> {
  return randomVoiceChannelNameCronMap;
}
