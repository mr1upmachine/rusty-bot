import { ActivityType, Client } from 'discord.js';
import { readFileSync } from 'fs';
import * as path from 'path';

const ACTIVITY_TYPE_TEXT_MAP: { [key: string]: ActivityType } = {
  Playing: 'PLAYING',
  Watching: 'WATCHING',
  'Listening to': 'LISTENING',
  'Competing in': 'COMPETING'
};

export function setRandomActivity(client: Client): void {
  const messages = readFileSync(
    path.join(__dirname, '../assets/activity-messages.txt')
  )
    .toString()
    .split('\n')
    .filter((message) => !message.startsWith('//'))
    .filter((message) => message.trim() !== '');

  const randomIndex = Math.floor(Math.random() * messages.length);
  const randomMessage = messages[randomIndex];

  let activity: string | undefined;
  let activityType: ActivityType | undefined;
  for (const [text, type] of Object.entries(ACTIVITY_TYPE_TEXT_MAP)) {
    const formattedText = `${text} `;
    if (randomMessage.startsWith(formattedText)) {
      activity = randomMessage.substring(formattedText.length);
      activityType = type;
      break;
    }
  }

  if (!activity || !activityType) {
    throw new Error(
      'Somehow activity or activityType does not exist. This should not happen.'
    );
  }

  client.user!.setActivity(activity, { type: activityType });
}
