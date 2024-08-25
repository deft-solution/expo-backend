import { Request } from 'express';
import { inject, injectable } from 'inversify';

import {
  Authorization, ContextRequest, Controller, GET, NotFoundError, POST
} from '../../packages';
import { ErrorCode } from '../enums/ErrorCode';
import { SocialLinkService, UserService } from '../services';

@Controller('/profile')
@injectable()
export class ProfileController {

  @inject('UserService')
  userService!: UserService;

  @inject('SocialLinkService')
  socialLinkService!: SocialLinkService;

  @GET('/v1/me')
  @Authorization
  async getAllBaby(
    @ContextRequest request: Request
  ) {
    if (!request.userId) {
      return {}
    }
    const user = await this.userService.findByIdActive(request.userId);
    if (!user) {
      throw new NotFoundError('You are UnAuthorization!.')
    }
    return user;
  }

  @POST('/v1/add/social-link')
  @Authorization
  async addSocialLink(
    @ContextRequest request: Request
  ) {
    if (!request.userId) {
      return {}
    }
    const { socialId, url } = request.body;
    const socialLink = await this.socialLinkService.findOneById(socialId);
    if (!socialLink) {
      throw new NotFoundError('Social Link does not allowed!.')
    }
    let user = await this.userService.findByIdActive(request.userId);
    if (!user) {
      throw new NotFoundError('User Does not existed!.', ErrorCode.UserDoesNotExist)
    }
    user.socials.push({ social: socialLink.id, url });
    await user.save();
    return user;
  }
}