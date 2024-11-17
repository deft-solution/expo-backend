export enum ErrorCode {
  UserDoesNotExist = 1000,
  UserIsExisted = 1001,
  VerificationCodeHasSent = 1002,
  InvalidVerificationCode = 1003,
  //
  InvalidPassword = 2000,
  InvalidToken = 2001,

  // Exhibition
  ExhibitionDoesNotExisted = 3000,

  // BoothType
  BoothTypeDoesNotExisted = 4000,
  BoothDoesNotExisted = 4001,

  // Exhibition
  EventDoesNotExisted = 5000,
  ProductQuantityLimitExceeded = 5001,

  // Order
  WeDontHaveThisOrderYet = 60000,
}
