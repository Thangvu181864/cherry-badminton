import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as zlib from 'zlib';
import * as path from 'path';
import * as archiver from 'archiver';
import * as extract from 'extract-zip';

import { LoggingService } from '@base/logging';

export interface IZip {
  filePath: string;
  fileName: string;
  size?: number; // bytes
}

@Injectable()
export class ZipService {
  constructor(private readonly loggingService: LoggingService) {}
  logger = this.loggingService.getLogger('zip-srv');

  zipFile(filePath?: string | null) {
    const compress = zlib.createGzip();
    const read = fs.createReadStream(filePath);
    const filePathCompress = filePath + '.zip';
    const write = fs.createWriteStream(filePathCompress);
    read.pipe(compress).pipe(write);
    return { filePathCompress };
  }

  unzipFile(filePathCompress?: string | null) {
    const decompress = zlib.createUnzip();
    const read = fs.createReadStream(filePathCompress);
    const filePathDecompress = filePathCompress.slice(
      0,
      filePathCompress.length - path.extname(filePathCompress).length,
    );
    const write = fs.createWriteStream(filePathDecompress);
    read.pipe(decompress).pipe(write);
    return { filePathDecompress };
  }

  /**
   * Unzip a file zip
   * @param filePath {path} Path to file
   * @param parentDirPath {path} path to the directory containing, default uses the current directory of the zip file
   * @param folderName {string} the folder name containing the extracted contents, the default is to use the file name
   * @return {Promise<string>} path to the extracted folder
   */
  async unzipFolder(
    filePath: string,
    parentDirPath?: string,
    folderName?: string,
  ): Promise<string> {
    parentDirPath = parentDirPath ?? path.dirname(filePath);
    folderName = folderName ?? path.parse(filePath).base;
    const folderPath = path.join(parentDirPath, folderName);
    folderPath && !fs.existsSync(folderPath) && fs.mkdirSync(folderPath, { recursive: true });
    await extract(filePath, { dir: folderPath });
    return folderPath;
  }

  /**
   * Compress a folder into a zip file
   * @param zippingDirPath {path} path to directory to zip
   * @param destDirPath {path} path to the directory contains file zip, default use the cha item of directory to zip
   * @return {IZip} zip infomation
   */
  async zipFolder(zippingDirPath: string, destDirPath: string): Promise<IZip> {
    destDirPath && !fs.existsSync(destDirPath) && fs.mkdirSync(destDirPath, { recursive: true });
    destDirPath = destDirPath ?? path.dirname(zippingDirPath);
    const fileName = path.parse(zippingDirPath).base + '.zip';
    const filePath = path.join(destDirPath, fileName);
    let size = 0;
    await new Promise<void>((resolve, rejects) => {
      const output = fs.createWriteStream(filePath);
      const archive = archiver('zip', { zlib: { level: 9 } });
      output.on('close', () => {
        size = archive.pointer();
        resolve();
      });
      archive.on('error', (err) => rejects(err));
      archive.on('warning', (err) => this.logger.warn(err));
      archive.pipe(output);
      archive.directory(zippingDirPath, path.parse(zippingDirPath).base);
      archive.finalize();
    });
    return { filePath, fileName, size };
  }
}
