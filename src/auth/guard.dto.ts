/*
 * @description: 登录管理员DTO
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import { ApiProperty } from '@nestjs/swagger';

export class LoginAdminDTO {
  @ApiProperty({
    title: 'username',
    description: '用户名',
  })
  username: string;

  @ApiProperty({
    title: 'password',
    description: '密码',
  })
  password: string;
}
