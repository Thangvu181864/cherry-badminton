import { Module } from '@nestjs/common';

import { ConfigModule } from '@config';
import { OtpService } from '@base/otp/otp.service';

@Module({
  imports: [ConfigModule],
  providers: [OtpService],
  exports: [OtpService],
})
export class OtpModule {}
