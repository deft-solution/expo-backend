import express from 'express';
import { inject, injectable } from 'inversify';

import { ContextRequest, Controller, POST } from '../../packages';
import { IVerifications } from '../models/Verifications';
import { VerificationService } from '../services';

@Controller('/verification')
@injectable()
export class VerificationController {

  @inject('VerificationService')
  verificationSv!: VerificationService;

  @POST('/v1/send')
  async sendEmailVerification(
    @ContextRequest req: express.Request,
  ): Promise<IVerifications> {
    const email = req.body.email;
    const verification = await this.verificationSv.create(email);
    return verification;
  }

  @POST('/v1/verify')
  async verifiedEmailCode(
    @ContextRequest req: express.Request,
  ): Promise<any> {
    const email = req.body.email;
    const verificationCode = req.body.verificationCode;
  }
}