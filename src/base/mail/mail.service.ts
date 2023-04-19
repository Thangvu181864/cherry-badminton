import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SentMessageInfo } from 'nodemailer';

import { ConfigService } from '@config';
import { Address } from '@nestjs-modules/mailer/dist/interfaces/send-mail-options.interface';
import { LoggingService } from '@base/logging';

@Injectable()
export class MailService {
  constructor(
    private readonly mailerService: MailerService,
    private readonly config: ConfigService,
    private readonly loggingService: LoggingService,
  ) {}
  private readonly logger = this.loggingService.getLogger(MailService.name);

  public async sendMail(
    receivers: string | Address | Array<string | Address>,
    subject: string,
    text?: string,
    template?: string,
    context?: Record<string, any>,
  ): Promise<SentMessageInfo> {
    return await this.mailerService
      .sendMail({
        to: receivers,
        from: this.config.EMAIL_USER,
        subject,
        text,
        template,
        context,
      })
      .catch((err) => {
        this.logger.error(err);
        throw err;
      });
  }
}
