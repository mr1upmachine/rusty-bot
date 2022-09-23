import type { ChatInputCommandInteraction } from 'discord.js';

import { RustyBotInvalidArgumentError } from '../../errors/rusty-bot-errors.js';
import type { DBGuildMember } from '../../db/types.js';
import { useGuildMembersRepository } from '../../db/use-guild-members-repository.js';
import { Command } from '../../types/command.js';
import type {
  CommandBuilder,
  CommandBuilderOutput
} from '../../types/command-builder.js';

const MAX_ABOUT_LENGTH = 2048;

class EditProfileCommand extends Command {
  public readonly description = 'Customize your user card!';

  override build(commandBuilder: CommandBuilder): CommandBuilderOutput {
    return commandBuilder.addStringOption((option) =>
      option.setName('aboutText').setDescription('Text on your user profile')
    );
  }

  async execute(
    interaction: ChatInputCommandInteraction<'cached'>
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    const guild = interaction.guild;
    const member = interaction.member;

    // Get dependencies
    const guildMembersRepository = useGuildMembersRepository(guild.id);

    // Get arguments
    const aboutText = interaction.options.getString('aboutText') ?? undefined;

    // Setup accumulators
    let newData: Partial<DBGuildMember> = {};
    const responseMessages: string[] = [];

    // Build & validate aboutText
    if (aboutText !== undefined) {
      if (aboutText.length > MAX_ABOUT_LENGTH) {
        throw new RustyBotInvalidArgumentError(
          'aboutText',
          `About sections can only be up to ${MAX_ABOUT_LENGTH} characters in length!`
        );
      }

      newData = { ...newData, aboutText };
      responseMessages.push(aboutText ? 'About set!' : 'About cleared!');
    }

    // Update db with new data
    await guildMembersRepository.save(member.id, newData);

    // Respond to user
    const formattedMessage = responseMessages.length
      ? responseMessages.join('\n')
      : 'Nothing changed.';
    await interaction.editReply(formattedMessage);
  }
}

export default EditProfileCommand;
