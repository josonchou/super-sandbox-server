/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileController } from './file.controller';
import { File } from './file.entity';
import { FileService } from './file.service';

@Module({
  imports: [TypeOrmModule.forFeature([File])],
  controllers: [FileController],
  providers: [FileService],
})
export class FileModule {}
