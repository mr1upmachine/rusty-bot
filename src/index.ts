import { Client, IntentsBitField, Partials } from 'discord.js';
import * as path from 'path';
import * as url from 'url';

import type { GCPAppOptions } from './create-db-connection.js';
import { createDBConnection } from './create-db-connection.js';
import { InvalidClientEventError } from './errors/rusty-bot-errors.js';
import { useEnv } from './services/use-env.js';
import type { ClientEventDerived } from './types/client-event-derived.js';
import type { CommandDerived } from './types/command-derived.js';
import { getDirectoryContents } from './utilities/get-directory-contents.js';
import { isClientEventString } from './utilities/is-client-event-string.js';
import { registerCommand } from './utilities/use-command.js';

// Define global state
// TODO define a global state manager that all resources can pull from
//      short term storage, long term lives in database still. possibly
//      move all database interaction to that level too

// Shared constants
const CURRENT_DIR = url.fileURLToPath(new URL('.', import.meta.url));
const {
  DISCORD_API_TOKEN,
  LOCAL,
  GPC_CLIENT_EMAIL,
  GPC_PROJECT_ID,
  GPC_PRIVATE_KEY
} = useEnv();

// Setup for discord.js
const globalClient = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.GuildMessageReactions,
    IntentsBitField.Flags.GuildEmojisAndStickers,
    IntentsBitField.Flags.DirectMessages,
    IntentsBitField.Flags.DirectMessageReactions
  ],
  partials: [Partials.Message, Partials.Reaction]
});
globalClient.token = DISCORD_API_TOKEN;

// Setup for DB
let gcpAppOptions: GCPAppOptions | undefined;
if (LOCAL && GPC_PROJECT_ID && GPC_PRIVATE_KEY && GPC_CLIENT_EMAIL) {
  gcpAppOptions = {
    projectId: GPC_PROJECT_ID,
    privateKey: GPC_PRIVATE_KEY,
    clientEmail: GPC_CLIENT_EMAIL
  };
}
createDBConnection(gcpAppOptions);

// Finds all command files in `./commands/` and registers them to global state
const COMMANDS_RELATIVE_FILE_PATH = './commands/';
const COMMANDS_FILE_PATH = path.join(CURRENT_DIR, COMMANDS_RELATIVE_FILE_PATH);
const COMMAND_FILE_METAS = await getDirectoryContents<CommandDerived>(
  COMMANDS_FILE_PATH
);
for (const { content, itemName } of COMMAND_FILE_METAS) {
  registerCommand(itemName, content);
}

// Finds all event files in `./events/` and creates listeners for all of them
const EVENTS_RELATIVE_FILE_PATH = './events/';
const EVENTS_FILE_PATH = path.join(CURRENT_DIR, EVENTS_RELATIVE_FILE_PATH);
const EVENT_FILE_METAS = await getDirectoryContents<ClientEventDerived>(
  EVENTS_FILE_PATH
);
for (const { content, itemName } of EVENT_FILE_METAS) {
  const eventName = itemName
    .toLowerCase()
    .replace(/([-_][a-z])/g, (group) =>
      group.toUpperCase().replace('-', '').replace('_', '')
    );

  if (!isClientEventString(eventName)) {
    throw new InvalidClientEventError(eventName);
  }

  const clientEvent = new content(eventName);

  if (clientEvent.once) {
    globalClient.once(eventName, (...args) => clientEvent.execute(...args));
  } else {
    globalClient.on(eventName, (...args) => clientEvent.execute(...args));
  }
}

// Login to discord and notify when completed.
await globalClient.login();
console.log('All done!');
