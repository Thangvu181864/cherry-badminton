import { ConfigModule } from '@config';
import { Module } from '@nestjs/common';
import { AwsS3Service } from '@base/aws/aws.service';

@Module({
  imports: [ConfigModule],
  providers: [AwsS3Service],
  exports: [AwsS3Service],
})
export class AwsModule {}
