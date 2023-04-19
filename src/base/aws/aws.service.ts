import { Readable } from 'stream';
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
  PutObjectCommandOutput,
  DeleteObjectCommandOutput,
  PutObjectCommandInput,
  DeleteObjectCommandInput,
  GetObjectCommandInput,
  GetObjectCommandOutput,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { readFileSync } from 'fs';

import { LoggingService } from '@base/logging';
import { uniqueFileName } from '@base/util/file.utils';
import * as HttpExc from '@base/api/exception';
import { ConfigService } from '@config';

import { ISignedUrl } from '@base/aws/aws.interface';

@Injectable()
export class AwsS3Service {
  constructor(
    private readonly config: ConfigService,
    private readonly loggingService: LoggingService,
  ) {}
  private readonly logger = this.loggingService.getLogger(AwsS3Service.name);

  async presignedUrl(fileName: string, folder?: string, expires?: number) {
    return await this._presignedUrl(uniqueFileName(fileName), folder, expires);
  }

  async upload(path: string, fileName: string, folder?: string) {
    const buffer = readFileSync(path);
    return await this._uploadS3(buffer, uniqueFileName(fileName), folder);
  }

  async delete(fileName: string, folder?: string) {
    return await this._deleteS3(folder ? `${folder}/${fileName}` : fileName);
  }

  async get(fileName: string, folder?: string) {
    return await this._getPrivateFileS3(folder ? `${folder}/${fileName}` : fileName);
  }

  // ======================================================
  // PRIVATE METHOD
  // ======================================================

  private async _presignedUrl(
    fileName: string,
    folder?: string,
    expires?: number,
  ): Promise<ISignedUrl> {
    const s3 = this.getS3Client();
    const filePath = folder ? `${folder}/${String(fileName)}` : String(fileName);
    const params: PutObjectCommandInput = {
      Bucket: this.config.AWS_S3_BUCKET,
      Key: filePath,
    };
    const command = new PutObjectCommand(params);
    try {
      const result = await getSignedUrl(s3, command, {
        expiresIn: expires || this.config.AWS_S3_EXPIRE_TIME,
      });
      return { Url: result, FilePath: filePath };
    } catch (e) {
      this.logger.error(e);
      throw new HttpExc.BusinessException({ message: e.message, errorCode: e.Code });
    }
  }

  private async _uploadS3(
    file: Buffer,
    fileName: string,
    folder?: string,
  ): Promise<PutObjectCommandOutput & { FilePath?: string }> {
    const s3 = this.getS3Client();
    const filePath = folder ? `${folder}/${String(fileName)}` : String(fileName);
    const params = {
      Bucket: this.config.AWS_S3_BUCKET,
      Key: filePath,
      Body: file,
    };
    const command = new PutObjectCommand(params);
    try {
      const result = await s3.send(command);
      return {
        ...result,
        FilePath: filePath,
      };
    } catch (e) {
      this.logger.error(e);
      throw new HttpExc.BusinessException({ message: e.message, errorCode: e.Code });
    }
  }

  private async _deleteS3(fileName: string): Promise<DeleteObjectCommandOutput> {
    const s3 = this.getS3Client();
    const params: DeleteObjectCommandInput = {
      Bucket: this.config.AWS_S3_BUCKET,
      Key: String(fileName),
    };
    const command = new DeleteObjectCommand(params);
    try {
      return await s3.send(command);
    } catch (e) {
      this.logger.error(e);
      throw new HttpExc.BusinessException({ message: e.message, errorCode: e.Code });
    }
  }

  private async _getPrivateFileS3(
    fileName: string,
  ): Promise<GetObjectCommandOutput & { Readable?: Readable }> {
    const s3 = this.getS3Client();
    const params: GetObjectCommandInput = {
      Bucket: this.config.AWS_S3_BUCKET,
      Key: String(fileName),
    };
    const command = new GetObjectCommand(params);
    try {
      const data = await s3.send(command);
      return { ...data, Readable: data.Body as Readable };
    } catch (e) {
      this.logger.error(e);
      throw new HttpExc.BusinessException({ message: e.message, errorCode: e.Code });
    }
  }

  private getS3Client(): S3Client {
    return new S3Client({
      credentials: {
        accessKeyId: this.config.AWS_S3_ACCESS_KEY,
        secretAccessKey: this.config.AWS_S3_ACCESS_SECRET,
      },
      endpoint: this.config.AWS_S3_ENDPOINT,
      region: this.config.AWS_S3_REGION,
      forcePathStyle: true, // needed with minio?
    });
  }
}
