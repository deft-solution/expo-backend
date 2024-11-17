import { REST } from '../../packages';
import { BabyService, BabyServiceImpl } from './BabyService';
import { BoothService, BoothServiceImpl } from './BoothService';
import { BoothTypeService, BoothTypeServiceImpl } from './BoothTypeService';
import { EventService, EventServiceImpl } from './EventService';
import { ExhibitionService, ExhibitionServiceImpl } from './ExhibitionService';
import { SocialLinkService, SocialLinkServiceImpl } from './SocialLinkService';
import { UserService, UserServiceImpl } from './UserService';
import { VerificationService, VerificationServiceImpl } from './VerificationSerivce';
import { SerialPrefixService, SerialPrefixServiceImpl } from './SerialPrefixService';
import { OrderServiceImpl, OrderService } from './OrderService';

REST.register('BabyService', BabyServiceImpl);
REST.register('UserService', UserServiceImpl);
REST.register('SocialLinkService', SocialLinkServiceImpl);
REST.register('VerificationService', VerificationServiceImpl);
REST.register('EventService', EventServiceImpl);
REST.register('ExhibitionService', ExhibitionServiceImpl);
REST.register('BoothTypeService', BoothTypeServiceImpl);
REST.register('BoothService', BoothServiceImpl);
REST.register('SerialPrefixService', SerialPrefixServiceImpl);
REST.register('OrderService', OrderServiceImpl);

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
  BoothTypeService,
  BoothTypeServiceImpl,
  BoothService,
  BoothServiceImpl,
  SerialPrefixService,
  SerialPrefixServiceImpl,
  OrderService,
  OrderServiceImpl,
};
