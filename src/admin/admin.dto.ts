/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsNumber, IsArray } from 'class-validator';

export class UpdateAdminPasswordDTO {
  @ApiProperty({
    description: '旧密码',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @ApiProperty({
    description: '新密码',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class CreateUserDTO {
  @ApiProperty({
    description: '账号',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: '角色',
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  role: number;
}

export class BatchRemoveUsers {
  @ApiProperty({
    description: '用户ID列表',
    required: true,
  })
  @IsNotEmpty()
  @IsArray()
  uids: number[];
}
