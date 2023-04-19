import { Injectable } from '@nestjs/common';

import { config } from '@config';

@Injectable()
export class UrlService {
  private _defaultFile = () =>
    `https://source.unsplash.com/random/${512}x${Math.round(256 + 256 * Math.random())}`;

  mediaUrl(filePath?: string | null) {
    return /http/.test(filePath ?? '')
      ? filePath
      : (filePath && [config.HOST, 'media', filePath].join('/')) || null;
  }

  uploadUrl(filePath?: string | null) {
    return /http/.test(filePath ?? '')
      ? filePath
      : (filePath && [config.HOST, 'uploads', filePath].join('/')) || null;
  }

  documentUrl(filePath?: string | null) {
    return /http/.test(filePath ?? '')
      ? filePath
      : (filePath && [config.HOST, 'documents', filePath].join('/')) || null;
  }

  memberAvatarUrl(filePath?: string | null) {
    return /http/.test(filePath ?? '')
      ? filePath
      : (filePath && [config.HOST, 'uploads', filePath].join('/')) || this._defaultFile();
  }
}
