/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createWriteStream, rmdir, existsSync, mkdirSync, readdir, readFile, WriteStream, statSync } from 'fs';
import { join } from 'path';
import { FileSnippetExtParams, IFile, MergeFileInfo } from 'src/common/IFile';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { sign } from 'jsonwebtoken';
import { MimeMap } from './consts';
import { File } from './file.entity';

const mime = require('mime');

function readdirPromise (...args: any[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    // @ts-ignore
    readdir(...args, (err, files) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(files);
    });
  });
}

const doWriteFile = (writeAble: WriteStream, buffer: any) =>
  new Promise((resolve, reject) => {
    writeAble.write(buffer, (err) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(true);
    });
  });

const getExt = (originalname: string) => {
  let ext = '';
  const idx = originalname.lastIndexOf('.');
  if (idx >= 0) {
    ext = originalname.substring(idx);
  }

  return ext;
}

const UploadPath = join(__dirname, '../../', 'storage');

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {}

  async saveFile(file: IFile) {
    const host = this.configService.get('app.host');
    const ext = getExt(file.originalname);
    const filename = `${Date.now()}-${uuid()}${ext}`;
    const absPath = join(UploadPath, filename);
    const writeFile = () =>
      new Promise((resolve, reject) => {
        const writeAble = createWriteStream(absPath);
        writeAble.write(file.buffer, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(true);
        });
      });

    await writeFile();
    const fileEntity = new File();
    fileEntity.filename = filename;
    fileEntity.originPath = absPath;
    fileEntity.uuid = uuid();
    fileEntity.size = file.size;
    fileEntity.encoding = file.encoding;
    fileEntity.path = `/files/${fileEntity.uuid}`;
    fileEntity.originFilename = file.originalname;
    fileEntity.host = host;
    fileEntity.mimetype = file.mimetype;
    fileEntity.fileType = MimeMap[file.mimetype] ?? '';

    return await this.fileRepository.save(fileEntity);
  }

  async saveSnippet(file: IFile, ext: FileSnippetExtParams): Promise<[boolean, string]> {
    // TODO 检测文件是否已经存在
    const { hash } = ext;

    const existsFile = await this.fileRepository.findOne({
      hash,
    });

    if (existsFile) {
      return [true, ''];
    }

    // 切片上传目录
    const chunksDir = join(UploadPath, ext.hash, '/');
    if (!existsSync(chunksDir)) {
      mkdirSync(chunksDir);
    }

    const chunksFilename = join(chunksDir, `${ext.hash}_${ext.index}`);
    
    // 秒传，如果切片已存在，则直接返回
    if (existsSync(chunksFilename)) {
      return [true, ''];
    }

    const writeFile = () =>
      new Promise((resolve, reject) => {
        const writeAble = createWriteStream(chunksFilename);
        writeAble.write(file.buffer, (err) => {
          if (err) {
            reject(err);
            
            writeAble.close();
            return;
          }
          resolve(true);
          writeAble.close();
        });
      });

    try {
      await writeFile();
    } catch (e) {
      return [false, e.message];
    }

    return [true, ''];
  }

  async mergeSnippet(mergeInfo: MergeFileInfo): Promise<[boolean, string|File]> {
    try {
      const { hash, total, originFilename } = mergeInfo;
      const existsFile = await this.fileRepository.findOne({
        hash,
      });
  
      if (existsFile) {
        return [true, existsFile];
      }
      // 切片上传目录
      const chunksDir = join(UploadPath, hash, '/');

      const files = await readdirPromise(chunksDir);

      if (files.length !== total || !files.length) {
        return [false, '上传失败，切片数量不符'];
      }
      const ext = getExt(originFilename ?? '');
      const filename = `${Date.now()}-${uuid()}${ext}`;
      const absPath = join(UploadPath, filename);
      const writeAble = createWriteStream(absPath);
      for (let i = 0; i <= files.length; i++) {
        if (i === files.length) {
          await (() => new Promise((resolve, reject) => {
            rmdir(chunksDir, (err) => {
              if (err) {
                console.log(err);
                resolve(true);
              } else {
                resolve(true);
              }
            })
          }))();
          break;
        }
        const chunkPath = join(chunksDir, `${hash}_${i}`);
        const fileBuffer = await (() => new Promise((resolve, reject) => {
          readFile(chunkPath, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          })
        }))()
        await doWriteFile(writeAble, fileBuffer);
      }
      writeAble.close();
      const fileStat = statSync(absPath);
      // @ts-ignore
      const mimeType = mime.getType(originFilename);
      console.log(mimeType, 'mimeType');
      const fileEntity = new File();
      fileEntity.filename = filename;
      fileEntity.originPath = absPath;
      fileEntity.uuid = uuid();
      fileEntity.size = fileStat.size;
      fileEntity.encoding = '';
      fileEntity.path = `/files/${fileEntity.uuid}`;
      fileEntity.originFilename = originFilename;
      fileEntity.host = '';
      fileEntity.mimetype = mimeType;
      fileEntity.fileType = MimeMap[mimeType] ?? '';
      fileEntity.hash = hash;

      const saved = await this.fileRepository.save(fileEntity);

      return [true, saved];
    } catch (e) {
      return [false, e?.message];
    }

  }

  async getFile(uuid: string) {
    const foundOne = await this.fileRepository.findOne({
      where: {
        uuid,
      },
    });

    return foundOne;
  }

  async genToken(params: any) {
    const office = this.configService.get('app.office');
    return sign(params, office.secret, {
      expiresIn: '7d'
    });
  }
}
