import { inject, injectable } from 'inversify';

import Mailer from '../configs/Mailer';
import { Order } from '../models';
import { OrderService } from './OrderService';

export interface EmailService {
  sentEmail: <T extends Object>(templateDir: string, recipientMail: string, dataSource: T, subject: string,) => Promise<void>
}

@injectable()
export class EmailServiceImpl implements EmailService {

  constructor() { }

  sentEmail<T extends Object>(
    templateDir: string,
    recipientMail: string,
    dataSource: T,
    subject: string,
  ): Promise<void> {
    const mailer = new Mailer<T>(templateDir, dataSource, { to: recipientMail, subject });
    return mailer.send();
  }
}