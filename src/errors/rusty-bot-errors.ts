export class MissingEnvironmentVariableError extends Error {
  constructor(variableName: string) {
    super(`${variableName} must be provided`);
    this.name = 'MissingEnvironmentVariableError';
  }
}

export class InvalidColorStringError extends Error {
  constructor(colorString: string) {
    super(`${colorString} is invalid`);
    this.name = 'InvalidColorStringError';
  }
}

export class RustyBotCommandError extends Error {
  constructor(replyMessage: string, internalMessage?: string) {
    super(replyMessage);
    this.name = 'RustyBotCommandError';

    if (internalMessage) console.error(internalMessage);
  }
}

export class RustyBotInvalidArgumentError extends RustyBotCommandError {
  constructor(argumentName: string, reason?: string) {
    const formattedReason = reason ? `\n${reason}` : '';
    const formattedMessage = `\`${argumentName}\` is invalid!${formattedReason}`;
    super(formattedMessage);
    this.name = 'RustyBotInvalidArgumentError';
  }
}
