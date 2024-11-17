import { injectable } from 'inversify';

import SocialLink, { ISocialLink } from '../models/SocialLink';

export interface SocialLinkService {
  insertMany(data: ISocialLink[]): Promise<ISocialLink[]>;
  findOneById(id: string): Promise<ISocialLink | null>;
}

@injectable()
export class SocialLinkServiceImpl implements SocialLinkService {
  insertMany(data: ISocialLink[]) {
    return SocialLink.insertMany(data);
  }

  findOneById(id: string) {
    return SocialLink.findOne({ _id: id });
  }
}
