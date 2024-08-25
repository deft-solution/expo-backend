import { injectable } from 'inversify';

import { Baby } from '../models/Baby';

export interface BabyService {
  letPlay: (ids: Baby[]) => Promise<string>;
}

@injectable()
export class BabyServiceImpl implements BabyService {
  public letPlay(ids: Baby[]): Promise<string> {
    return new Promise((resolve) => (
      setTimeout(() => {
        resolve(`Playground Service letPlay called ${JSON.stringify(ids)}`);
      }, 100)
    ));
  }
}