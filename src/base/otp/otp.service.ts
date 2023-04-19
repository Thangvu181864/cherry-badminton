import { authenticator } from 'otplib';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@config';

@Injectable()
export class OtpService {
  constructor(private readonly config: ConfigService) {}

  public generateOTP(secretKey: string): string {
    authenticator.options = {
      ...this.config.OTP_OPTION,
      epoch: Date.now(),
    };
    const secret = this.config.OTP_SECRET + secretKey;
    return authenticator.generate(secret);
  }

  public verifyOTP(token, secretKey: string) {
    try {
      authenticator.options = {
        ...this.config.OTP_OPTION,
        epoch: Date.now(),
      };
      const secret = this.config.OTP_SECRET + secretKey;
      return authenticator.verify({ token, secret });
    } catch (err) {
      console.error(err);
    }
  }
}
