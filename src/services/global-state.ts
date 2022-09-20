import type { Firestore } from '@google-cloud/firestore';
import type { CronJob } from 'cron';

interface GlobalState {
  activityCronJob?: CronJob;
  firestore?: Firestore;
  randomVoiceChannelNameCronMap: Map<string, CronJob>;
}

// TODO find a better way to do this
export const GLOBAL_STATE: GlobalState = {
  randomVoiceChannelNameCronMap: new Map<string, CronJob>()
};
