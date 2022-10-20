import type {
  ChatInputCommandInteraction,
  GuildMember,
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
import { useLogger } from '../../services/use-logger.js';

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
    const member = interaction.member as GuildMember;

    // Get dependencies
    const guildChannelsRepository = useGuildChannelsRepository(guild.id);
    const logger = await useLogger(guild);

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
    const oldToNewNameMap = await setRandomVoiceChannelNames(channels);

    // Respond to user
    await interaction.editReply('Voice channel names shuffled');

    // Log to logging channel
    const logText = oldToNewNameMap.reduce(
      (acc, [oldName, newName]) => acc + `${oldName} -> ${newName}\n`,
      `Voice channel names have been manually shuffled by ${member.user.tag}:\n`
    );
    void logger.info(logText);
  }
}

export default ShuffleVoiceChannelNamesCommand;
