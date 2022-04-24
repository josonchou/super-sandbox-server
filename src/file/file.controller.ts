/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import {
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { AuthPublic } from 'src/auth';
import { IFile } from 'src/common/IFile';
import { FileService } from './file.service';

@Controller('files')
export class FileController {
  constructor(private readonly fileService: FileService) {}
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: IFile) {
    console.log(file, 'file==>');
    const savedFile = await this.fileService.saveFile(file);
    let host = 'localhost';
    if (savedFile.host) {
      host = savedFile.host;
    }

    return {
      id: savedFile.id,
      uuid: savedFile.uuid,
      viewPath: `http://${host}/srv/files/view/${savedFile.uuid}`,
    };
  }

  @Get('view/:uuid')
  @AuthPublic()
  async viewFile(@Param('uuid') uuid: string, @Res() res: Response) {
    const file = await this.fileService.getFile(uuid);

    if (!file) {
      res.send('Error File');
    }
    res.sendFile(file.originPath);
  }
}
