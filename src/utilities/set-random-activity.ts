import type { ClientUser } from 'discord.js';

import { getRandomActivitiesFromFile } from './get-random-activities-from-file.js';

export async function setRandomActivity(user: ClientUser): Promise<void> {
  const { values } = await getRandomActivitiesFromFile();

  const randomIndex = Math.floor(Math.random() * values.length);
  const [activityType, activityText] = values[randomIndex];

  user.setActivity(activityText, { type: activityType });
}
