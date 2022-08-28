/*
 * @description: 管理员模块
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CategoryModule } from 'src/category/category.module';
import { CategoryService } from 'src/category/category.service';
import { AdminController } from './admin.controller';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';
import { AdminPassword } from './adminPassword.entity';
import { Setting } from './setting.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Admin, AdminPassword, Setting]),
    CategoryModule,
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
