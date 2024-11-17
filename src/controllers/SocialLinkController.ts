import * as express from 'express';
import { inject, injectable } from 'inversify';

import { Authorization, ContextRequest, Controller, POST } from '../../packages';
import { ISocialLink } from '../models/SocialLink';
import { SocialLinkService, UserService } from '../services';

@injectable()
@Controller('/social-link')
export class SocialLinkController {
  @inject('SocialLinkService')
  socialLinkService!: SocialLinkService;

  @inject('UserService')
  userService!: UserService;

  @POST('/v1/create-batch')
  @Authorization
  async createBatchSocialLink(@ContextRequest request: express.Request<any, any, ISocialLink[]>) {
    if (!request.userId) {
      return {};
    }
    const user = await this.userService.findByIdActive(request.userId);
    let data = request.body ?? [];
    data = data.map((row: ISocialLink): any => ({ ...row, createdBy: user }));

    const socialLinks = await this.socialLinkService.insertMany(data);
    return socialLinks;
  }
}
