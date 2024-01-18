import type { Guild, VoiceBasedChannel } from 'discord.js';
import CronParser from 'cron-parser';

import { useGuildChannelsRepository } from '../../../../db/use-guild-channels-repository.js';
import { useGuildsRepository } from '../../../../db/use-guilds-repository.js';
import {
  CronTooFrequentError,
  RustyBotInvalidArgumentError
} from '../../../../errors/rusty-bot-errors.js';
import { setupRandomVoiceChannelNamesCron } from '../../../../utilities/setup-random-voice-channel-names-cron.js';
import type { RandomVoiceChannelNamesFrequencyChoice } from './constants.js';
import { RANDOM_VOICE_CHANNEL_NAMES_FREQUENCY_MAP } from './constants.js';
import {
  CHANNEL_NAME_CHANGE_RATE_LIMIT,
  RUSTY_WEBSITE_URL
} from '../../../../utilities/constants.js';

export async function setRandomVoiceChannelNamesCronConfig(
  guild: Guild,
  value: string,
  timezone: string | null
): Promise<string> {
  // Validate cron expression
  try {
    // Parse string to see if valid
    const interval = CronParser.parseExpression(value);

    // Check if interval is too frequent
    const minuteIntervals = [...interval.fields.minute].sort((a, b) => a - b);
    if (minuteIntervals.length >= 2) {
      for (let i = 0; i < minuteIntervals.length - 1; i++) {
        const first = minuteIntervals[i];
        const second = minuteIntervals[i + 1];
        if (second - first < CHANNEL_NAME_CHANGE_RATE_LIMIT) {
          throw new CronTooFrequentError(
            `Cannot set cron expression to less then ${CHANNEL_NAME_CHANGE_RATE_LIMIT} minute intervals.`
          );
        }
      }
    }
  } catch (e) {
    if (e instanceof CronTooFrequentError) {
      throw new RustyBotInvalidArgumentError('value', e.message);
    }

    throw new RustyBotInvalidArgumentError(
      'value',
      'Must be a valid cron expression. Use https://crontab.guru/ for help building a cron expression.'
    );
  }

  // Validate timezone
  if (
    timezone?.length &&
    !Intl.supportedValuesOf('timeZone').includes(timezone)
  ) {
    throw new RustyBotInvalidArgumentError(
      'timezone',
      `Must be a valid IANA timezone string. See a full list at ${RUSTY_WEBSITE_URL}/timezone`
    );
  }

  // Get dependencies
  const guildsRepository = useGuildsRepository();
  const guildChannelsRepository = useGuildChannelsRepository(guild.id);

  // Set value in database
  await guildsRepository.save(guild.id, {
    randomVoiceChannelNamesFrequency: value,
    randomVoiceChannelNamesTimezone: timezone ?? undefined
  });

  // Fetch all enabled channels
  const dbEnabledChannels =
    await guildChannelsRepository.findByRandomVoiceChannelNames(true);
  const dbEnabledChannelIds = dbEnabledChannels.map(({ id }) => id);

  // Map dbChannels to discord channels
  const channels = Array.from(
    guild.channels.cache
      .filter((channel): channel is VoiceBasedChannel => channel.isVoiceBased())
      .filter((channel) => dbEnabledChannelIds.includes(channel.id))
      .values()
  );

  // Update cron job
  setupRandomVoiceChannelNamesCron(
    guild,
    channels,
    value,
    timezone ?? undefined
  );

  // Build response text
  const choiceKeys = Object.keys(
    RANDOM_VOICE_CHANNEL_NAMES_FREQUENCY_MAP
  ) as RandomVoiceChannelNamesFrequencyChoice[];
  const valueText =
    choiceKeys
      .find((key) => RANDOM_VOICE_CHANNEL_NAMES_FREQUENCY_MAP[key] === value)
      ?.toLowerCase() ?? value;
  const response = `Random voice channel names will now update ${valueText}.`;
  return response;
}
