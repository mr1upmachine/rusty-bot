import type { ChatInputCommandInteraction } from 'discord.js';
import { PermissionFlagsBits } from 'discord.js';

import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';
import { Command } from '../../types/command.js';
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

    await setRandomVoiceChannelNames(interaction.guild!);

    await interaction.editReply('Voice channel names shuffled');
  }
}

export default ShuffleVoiceChannelNamesCommand;
