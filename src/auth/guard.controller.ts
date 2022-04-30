/*
 * @description: 守卫控制器
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import {
  Body,
  Controller,
  Get,
  Post,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthPublic } from './guard';
import { LoginAdminDTO } from './guard.dto';
import { GuardService } from './guard.service';

@Controller('guard')
@ApiTags('守卫模块')
export class GuardController {
  constructor(
    private readonly guardService: GuardService,
    private readonly configService: ConfigService,
  ) {}

  @AuthPublic()
  @Post('login/admin')
  @ApiOperation({ summary: '登录管理员' })
  async loginAdmin(@Body() loginAdminDto: LoginAdminDTO) {
    const { username, password } = loginAdminDto;

    // const privateKey = 'shared.admin.key';
    // 是否认证通过
    const [token, admin] = await this.guardService.authAdmin(
      username,
      password,
    );

    return {
      token,
      admin,
    };
  }

  @AuthPublic()
  @Get('ping')
  @ApiOperation({ summary: 'check connect' })
  async connect() {
    return {
      connect: 'pong',
    }
  }
}
