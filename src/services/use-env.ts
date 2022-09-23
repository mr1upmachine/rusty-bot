import * as dotenv from 'dotenv';

import { MissingEnvironmentVariableError } from '../errors/rusty-bot-errors.js';
import { coerceBoolean } from '../utilities/coerce-boolean.js';

interface RustyBotEnvVariablesBase {
  DISCORD_API_TOKEN: string;
  LOCAL: false;
  GPC_CLIENT_EMAIL?: string;
  GPC_PRIVATE_KEY?: string;
  GPC_PROJECT_ID?: string;
}

interface RustyBotLocalEnvVariables {
  DISCORD_API_TOKEN: string;
  LOCAL: true;
  GPC_CLIENT_EMAIL: string;
  GPC_PRIVATE_KEY: string;
  GPC_PROJECT_ID: string;
}

type RustyBotEnvVariables =
  | RustyBotEnvVariablesBase
  | RustyBotLocalEnvVariables;

let env: RustyBotEnvVariables | undefined;

export function useEnv(): RustyBotEnvVariables {
  if (env) {
    return env;
  }

  dotenv.config();
  const {
    DISCORD_API_TOKEN,
    GPC_CLIENT_EMAIL,
    GPC_PRIVATE_KEY,
    GPC_PROJECT_ID
  } = process.env;
  const LOCAL = coerceBoolean(process.env.LOCAL);

  // Verify environment variables
  if (!DISCORD_API_TOKEN) {
    throw new MissingEnvironmentVariableError('DISCORD_API_TOKEN');
  }
  if (LOCAL) {
    if (!GPC_CLIENT_EMAIL) {
      throw new MissingEnvironmentVariableError('GPC_CLIENT_EMAIL');
    }
    if (!GPC_PRIVATE_KEY) {
      throw new MissingEnvironmentVariableError('GPC_PRIVATE_KEY');
    }
    if (!GPC_PROJECT_ID) {
      throw new MissingEnvironmentVariableError('GPC_PROJECT_ID');
    }
  }

  return {
    DISCORD_API_TOKEN,
    LOCAL,
    GPC_CLIENT_EMAIL,
    GPC_PRIVATE_KEY,
    GPC_PROJECT_ID
  } as RustyBotEnvVariables;
}
