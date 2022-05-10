/*
 * @description: 管理员模块控制器
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import { Body, Controller, Delete, Get, Post, Put, Query, Req } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { ApiBan, AuthPublic } from 'src/auth';
import { BackendApi } from 'src/auth/guard';
import Ability from 'src/constanst/ability';
import TrainingCategory from 'src/constanst/trainingCategory';
import { BatchRemoveUsers, CreateUserDTO, UpdateAdminPasswordDTO } from './admin.dto';
import { Admin } from './admin.entity';
import { AdminService } from './admin.service';

@Controller('admin')
@ApiTags('管理员模块')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('gen/super/admin')
  @ApiOperation({ summary: '生成超级管理员' })
  @AuthPublic()
  @ApiBan()
  async genSuperAdmin() {
    const { id } = await this.adminService.createSuperAdmin();
    return {
      id,
    };
  }

  @Put('setting/password')
  @BackendApi()
  async updateAdminPassword(
    @Req() req: Request,
    @Body() dto: UpdateAdminPasswordDTO,
  ) {
    const loginAdmin = req.app.get('loginAdmin') as Admin;
    await this.adminService.updateAdminPassword(
      loginAdmin.id,
      dto.oldPassword,
      dto.newPassword,
    );
  }

  @Get('/userInfo')
  @BackendApi()
  async getUserInfo(
    @Req() req: Request,
  ) {
    const loginAdmin = req.app.get('loginAdmin') as Admin;

    const admin = await this.adminService.getAdminInfo(loginAdmin.id);

    return {
      userInfo: admin,
      ability: Ability,
      trainingCategory: TrainingCategory,
    };
  }

  @Post('/users')
  @ApiOperation({ summary: '创建用户' })
  @BackendApi()
  async createAdmin(
    @Body() dto: CreateUserDTO,
  ) {
    const { id } = await this.adminService.createAdmin(
      dto.username,
      dto.role,
    );

    return id;
  }

  @Get('/users')
  @BackendApi()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiParam({
    name: 'username',
    required: false,
    description: '账号'
  })
  async getUsers(
    @Query('page') page: number,
    @Query('pageSize') pageSize: number,
    @Query('username') username: string,
  ) {
    const result = await this.adminService.getUsers({
      page,
      pageSize,
      username,
    });

    return result;
  }

  @Delete('/users')
  @BackendApi()
  @ApiOperation({ summary: '删除用户' })
  async batchRemoveUsers(@Body() dto: BatchRemoveUsers) {
    await this.adminService.batchRemoveUsers(dto.uids);

    return dto.uids;
  }
}
