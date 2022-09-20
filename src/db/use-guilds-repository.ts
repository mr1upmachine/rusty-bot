import { GuildsRepository } from './guilds-repository.js';

let guildsRepositoryInstance: GuildsRepository;

export function useGuildsRepository(): GuildsRepository {
  guildsRepositoryInstance ??= new GuildsRepository();
  return guildsRepositoryInstance;
}
