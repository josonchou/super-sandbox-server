/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createWriteStream } from 'fs';
import { join } from 'path';
import { IFile } from 'src/common/IFile';
import { Repository } from 'typeorm';
import { v4 as uuid } from 'uuid';
import { sign } from 'jsonwebtoken';
import { MimeMap } from './consts';
import { File } from './file.entity';

@Injectable()
export class FileService {
  constructor(
    @InjectRepository(File)
    private readonly fileRepository: Repository<File>,
    private readonly configService: ConfigService,
  ) {}

  async saveFile(file: IFile) {
    const host = this.configService.get('app.host');
    let ext = '';
    const idx = file.originalname.lastIndexOf('.');
    if (idx >= 0) {
      ext = file.originalname.substring(idx);
    }
    const filename = `${Date.now()}-${uuid()}${ext}`;
    const absPath = join(__dirname, '../../', 'storage', filename);
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
