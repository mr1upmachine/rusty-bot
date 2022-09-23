import type { RandomVoiceChannelNamesCronMeta } from '../types/random-voice-channel-names-cron-meta';

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
