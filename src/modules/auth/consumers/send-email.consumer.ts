import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';

import { IQueueSendMail } from '@modules/auth/dto/send-email.dto';
import { RedisService } from '@base/db/redis';
import { LoggingService } from '@base/logging';
import { MailService } from '@base/mail/mail.service';
import { OtpService } from '@base/otp/otp.service';
import { ConfigService } from '@config';
import { QUEUE_NAME, SEND_MAIL } from '@shared/constants';

@Processor(QUEUE_NAME.SEND_MAIL)
export class SendMailConsumer {
  readonly logger = new LoggingService().getLogger(SendMailConsumer.name);

  constructor(
    private readonly mailService: MailService,
    private readonly otpService: OtpService,
    private readonly redisService: RedisService,
    private readonly config: ConfigService,
  ) {}

  @Process(SEND_MAIL.RESGISTER)
  async sendMailRegister(job: Job<IQueueSendMail>) {
    const otpExist = await this.redisService.global().get(`global:sendMail:${job.data.email}`);
    if (otpExist) {
      this.logger.log(`Email: ${job.data.email} has been sent`);
      return;
    }
    const otp = this.otpService.generateOTP(this.config.OTP_SECRET);
    await this.redisService.global().set(`global:sendMail:${job.data.email}`, otp, {
      ttl: this.config.OTP_OPTION.step * this.config.OTP_OPTION.window,
    });
    console.log('otp', otp);
    // await this.mailService.sendMail(
    //   job.data.email,
    //   'Email verification register',
    //   'Your OTP is: ' + otp,
    //   'verify-email.template.html',
    //   { code: otp, url: 'https://google.com', name: 'Google' },
    // );
  }

  @Process(SEND_MAIL.FORGOT_PASSWORD)
  async sendMailForgotPassword(job: Job<IQueueSendMail>) {
    const sendMailExist = await this.redisService.global().get(`global:sendMail:${job.data.email}`);
    if (sendMailExist) {
      this.logger.log(`Email: ${job.data.email} has been sent`);
      return;
    }
    const otp = this.otpService.generateOTP(this.config.OTP_SECRET);
    await this.redisService.global().set(`global:sendMail:${job.data.email}`, otp, {
      ttl: this.config.OTP_OPTION.step * this.config.OTP_OPTION.window,
    });
    await this.mailService.sendMail(
      job.data.email,
      'Email verification forgot password',
      'Your OTP is: ' + otp,
      'forgot-password.template.html',
      { code: otp, url: 'https://google.com', name: 'Google' },
    );
  }
}
