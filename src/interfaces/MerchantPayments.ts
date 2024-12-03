import { Currency } from '../enums/Currency';
import { MerchantPaymentType } from '../enums/Payment';

export interface IMerchantPaymentValidation {
  phoneNumber: string;
  accountId: string;
  merchantName: string;
  tag: string;
  currency: Currency;
  merchantType: MerchantPaymentType;
  merchant: string;
  storeLabel: string;
  note: string | null;
  isActive: boolean;
  isDefault: boolean;
}
