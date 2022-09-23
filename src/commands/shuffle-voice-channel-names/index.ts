import type {
  ChatInputCommandInteraction,
  VoiceBasedChannel
} from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';

import { useGuildChannelsRepository } from '../../db/use-guild-channels-repository.js';
import { Command } from '../../types/command.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';
import { setRandomVoiceChannelNames } from '../../utilities/set-random-voice-channel-names.js';

class ShuffleVoiceChannelNamesCommand extends Command {
  public readonly description = 'Sets all voice channel names to random ones';

  override build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder.setDefaultMemberPermissions(
      PermissionFlagsBits.Administrator
    );
  }

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild!;

    // Get dependencies
    const guildChannelsRepository = useGuildChannelsRepository(guild.id);

    // Fetch all enabled channels
    const dbEnabledChannels =
      await guildChannelsRepository.findByRandomVoiceChannelNames(true);
    const dbEnabledChannelIds = dbEnabledChannels.map(({ id }) => id);

    // Map dbChannels to discord channels
    const channels = Array.from(
      guild.channels.cache
        .filter((channel): channel is VoiceBasedChannel =>
          channel.isVoiceBased()
        )
        .filter((channel) => dbEnabledChannelIds.includes(channel.id))
        .values()
    );

    // Update channel names
    await setRandomVoiceChannelNames(channels);

    // Respond to user
    await interaction.editReply('Voice channel names shuffled');
  }
}

export default ShuffleVoiceChannelNamesCommand;
