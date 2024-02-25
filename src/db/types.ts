import type { WhereFilterOp } from '@google-cloud/firestore';

export interface BaseModel {
  readonly id: string;
}

export type DBRoot = BaseModel;

export interface DBGuild extends BaseModel {
  readonly randomVoiceChannelNamesFrequency?: string;
  readonly randomVoiceChannelNamesTimezone?: string;
}

export interface DBGuildChannel extends BaseModel {
  readonly karmaTracking?: boolean;
  readonly randomVoiceChannelNames?: boolean;
}

export interface DBGuildMember extends BaseModel {
  /** @deprecated use aboutText instead */
  readonly about?: string;
  readonly aboutText?: string;
  readonly color?: string;
  /** @deprecated use color instead */
  readonly infoColor?: string;
  readonly karma?: number;
  readonly name?: string;
  readonly posts?: number;
}

export interface DBGuildMessage extends BaseModel {
  readonly attachment?: string;
  readonly content?: string;
  readonly member?: string;
  readonly reactionCount?: number;
}

export type DBQueryOp = WhereFilterOp;
