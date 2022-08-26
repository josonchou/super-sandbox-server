/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import {
  Body,
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
import { BackendApi } from 'src/auth/guard';
import { BadReqException } from 'src/common/BadReqException';

import { FileSnippetExtParams, IFile, MergeFileInfo } from 'src/common/IFile';
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

  @Post('snippet/upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSnippet(
    @UploadedFile() file: IFile,
    @Body() ext: FileSnippetExtParams,
  ) {
    const [uploadOk, msg] = await this.fileService.saveSnippet(file, ext);
    if (!uploadOk) {
      throw new BadReqException(msg || '上传失败');
    }
    return true;
    // console.log(ext);
    return true;
  }

  @Post('snippet/merge')
  async snippetMerge(@Body() data: MergeFileInfo) {
    const [ok, file] = await this.fileService.mergeSnippet(data);

    if (!ok) {
      throw new BadReqException(file as string);
    }

    return file;
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

  @Post('reader/token')
  @BackendApi()
  async reader(@Body() config: any) {
    return this.fileService.genToken(config);
  }
}
