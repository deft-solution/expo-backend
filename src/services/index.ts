import { REST } from '../../packages';
import { BabyService, BabyServiceImpl } from './BabyService';
import { EventService, EventServiceImpl } from './EventService';
import { ExhibitionService, ExhibitionServiceImpl } from './ExhibitionService';
import { SocialLinkService, SocialLinkServiceImpl } from './SocialLinkService';
import { UserService, UserServiceImpl } from './UserService';
import { VerificationService, VerificationServiceImpl } from './VerificationSerivce';

REST.register("BabyService", BabyServiceImpl);
REST.register("UserService", UserServiceImpl);
REST.register("SocialLinkService", SocialLinkServiceImpl);
REST.register("VerificationService", VerificationServiceImpl);
REST.register("EventService", EventServiceImpl);
REST.register("ExhibitionService", ExhibitionServiceImpl);

export {
  BabyServiceImpl,
  BabyService,
  UserService,
  UserServiceImpl,
  SocialLinkService,
  SocialLinkServiceImpl,
  VerificationService,
  VerificationServiceImpl,
  EventService,
  EventServiceImpl,
  ExhibitionService,
  ExhibitionServiceImpl,
};