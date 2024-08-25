import { REST } from '../../packages';
import { AuthenticationController } from './AuthenticationController';
import { BabyController } from './BabyController';
import { FileController } from './FileController';
import { ProfileController } from './ProfileController';
import { SocialLinkController } from './SocialLinkController';
import { VerificationController } from './VerificationController';
import { WarriorController } from './WarriorController';

REST.register('BabyController', BabyController);
REST.register('AuthenticationController', AuthenticationController);
REST.register('WarriorController', WarriorController);
REST.register('FileController', FileController);
REST.register('ProfileController', ProfileController);
REST.register('SocialLinkController', SocialLinkController);
REST.register('VerificationController', VerificationController);

export default [
  BabyController, // Demo
  WarriorController, // Demo
  //
  FileController,
  AuthenticationController,
  ProfileController,
  SocialLinkController,
  VerificationController,
]