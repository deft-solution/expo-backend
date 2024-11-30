import { Currency } from '../enums/Currency';

export class CurrencyHelper {
  #KHR_EXCHANGE_RATE: number;

  constructor() {
    this.#KHR_EXCHANGE_RATE = Number(process.env.KHR_EXCHANGE_RATE) || 4096;
  }

  /**
   * Get the exchange rate between two currencies.
   *
   * @param fromCurrency - The currency to convert from.
   * @param toCurrency - The currency to convert to.
   * @returns - The exchange rate for converting from `fromCurrency` to `toCurrency`.
   */
  getExchangeRate(fromCurrency: Currency, toCurrency: Currency): number {
    if (fromCurrency === Currency.USD && toCurrency === Currency.KHR) {
      return this.#KHR_EXCHANGE_RATE; // USD to KHR
    }

    if (fromCurrency === Currency.KHR && toCurrency === Currency.USD) {
      return 1 / this.#KHR_EXCHANGE_RATE; // KHR to USD
    }

    // If currencies are the same, no conversion is needed
    if (fromCurrency === toCurrency) {
      return 1;
    }

    // Throw error if conversion is not supported
    throw new Error(`Exchange rate from ${fromCurrency} to ${toCurrency} is not available.`);
  }

  /**
   * Converts an amount from one currency to another using the stored exchange rates.
   *
   * @param amount - The amount to convert.
   * @param fromCurrency - The currency of the input amount.
   * @param toCurrency - The target currency for conversion.
   * @returns - The converted amount in the target currency.
   */
  convertCurrency(amount: number, fromCurrency: Currency, toCurrency: Currency): number {
    if (fromCurrency === toCurrency) {
      return amount; // No conversion needed if currencies are the same
    }

    const rate = this.getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  }
}
