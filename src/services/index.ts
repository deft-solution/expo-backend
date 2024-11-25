import { REST } from '../../packages';
import { BabyService, BabyServiceImpl } from './BabyService';
import { BakongService, BakongServiceImpl } from './BakongTokenService';
import { BoothService, BoothServiceImpl } from './BoothService';
import { BoothTypeService, BoothTypeServiceImpl } from './BoothTypeService';
import { EventService, EventServiceImpl } from './EventService';
import { ExhibitionService, ExhibitionServiceImpl } from './ExhibitionService';
import { OrderService, OrderServiceImpl } from './OrderService';
import { SerialPrefixService, SerialPrefixServiceImpl } from './SerialPrefixService';
import { SitAPIService, SitAPIServiceImpl } from './SitAPIService';
import { SocialLinkService, SocialLinkServiceImpl } from './SocialLinkService';
import { TransactionService, TransactionServiceImpl } from './TransactionService';
import { UserService, UserServiceImpl } from './UserService';
import { VerificationService, VerificationServiceImpl } from './VerificationSerivce';

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
REST.register('SitAPIService', SitAPIServiceImpl);
REST.register('BakongService', BakongServiceImpl);
REST.register('TransactionService', TransactionServiceImpl);

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
  SitAPIService,
  SitAPIServiceImpl,
  BakongService,
  BakongServiceImpl,
  TransactionService,
  TransactionServiceImpl,
};
