export class Utils {

  static generateVerificationCode(): string {
    // Generate a random 6-digit number and pad with leading zeros if necessary
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}