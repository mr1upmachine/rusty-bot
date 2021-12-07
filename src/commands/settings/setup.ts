import { CommandInteraction } from 'discord.js';

/** Not yet implemented: will contain a wizard for first time server setup */
export async function setup(
  // firestore: FirebaseFirestore.Firestore,
  interaction: CommandInteraction
) {
  interaction.reply({
    content: `I haven't been implemented yet! Please use the other settings commands to configure me for your server.`,
    ephemeral: true
  });
}
