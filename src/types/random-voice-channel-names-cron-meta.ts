import type { CronJob } from 'cron';

export interface RandomVoiceChannelNamesCronMeta {
  cronJob: CronJob;
  frequency: string;
}
