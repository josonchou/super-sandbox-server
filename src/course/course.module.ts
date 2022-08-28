/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from 'src/category/category.module';
import { File } from 'src/file/file.entity';
import { CourseController } from './course.controller';
import { Course } from './course.entity';
import { CourseService } from './course.service';

@Module({
  imports: [TypeOrmModule.forFeature([Course, File]), CategoryModule],
  controllers: [CourseController],
  providers: [CourseService],
})
export class CourseModule {}
