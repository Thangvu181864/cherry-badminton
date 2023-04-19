import { Module } from '@nestjs/common';
import { UrlService } from '@base/util/url/url.service';
import { ZipService } from '@base/util/file/zip.service';

@Module({
  providers: [UrlService, ZipService],
  exports: [UrlService, ZipService],
})
export class UtilModule {}
