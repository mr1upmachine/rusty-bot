export enum RandomVoiceChannelNamesSubcommand {
  Channel = 'channel',
  Cron = 'cron',
  Frequency = 'frequency'
}

export enum RandomVoiceChannelNamesFrequencyChoice {
  Daily = 'Daily',
  Hourly = 'Hourly',
  Monthly = 'Monthly',
  TwiceDaily = 'Twice Daily',
  TwiceWeekly = 'Twice Weekly',
  Weekly = 'Weekly'
}

export enum RandomVoiceChannelNamesFrequencyCron {
  Daily = '0 0 0 * * *',
  Hourly = '0 0 * * * *',
  Monthly = '0 0 0 1 * *',
  TwiceDaily = '0 0 0,12 * * *',
  TwiceWeekly = '0 0 0 * * SUN,THU',
  Weekly = '0 0 0 * * SUN'
}

type RandomVoiceChannelNamesFrequencyMap = Record<
  RandomVoiceChannelNamesFrequencyChoice,
  RandomVoiceChannelNamesFrequencyCron
>;
export const RANDOM_VOICE_CHANNEL_NAMES_FREQUENCY_MAP: RandomVoiceChannelNamesFrequencyMap =
  {
    [RandomVoiceChannelNamesFrequencyChoice.Daily]:
      RandomVoiceChannelNamesFrequencyCron.Daily,
    [RandomVoiceChannelNamesFrequencyChoice.Hourly]:
      RandomVoiceChannelNamesFrequencyCron.Hourly,
    [RandomVoiceChannelNamesFrequencyChoice.Monthly]:
      RandomVoiceChannelNamesFrequencyCron.Monthly,
    [RandomVoiceChannelNamesFrequencyChoice.TwiceDaily]:
      RandomVoiceChannelNamesFrequencyCron.TwiceDaily,
    [RandomVoiceChannelNamesFrequencyChoice.TwiceWeekly]:
      RandomVoiceChannelNamesFrequencyCron.TwiceWeekly,
    [RandomVoiceChannelNamesFrequencyChoice.Weekly]:
      RandomVoiceChannelNamesFrequencyCron.Weekly
  };

export const RANDOM_VOICE_CHANNEL_NAMES_FREQUENCY_CHOICES: {
  name: string;
  value: string;
}[] = Object.entries(RANDOM_VOICE_CHANNEL_NAMES_FREQUENCY_MAP).map(
  ([choice, cron]) => {
    return {
      name: choice,
      value: cron
    };
  }
);
