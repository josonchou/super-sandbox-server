/*
 * @description: 管理员
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import { CommonEntity } from 'src/common/common.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { AdminPassword } from './adminPassword.entity';

@Entity({
  name: 'admins',
})
export class Admin extends CommonEntity {
  @Column({
    nullable: true,
  })
  username: string; // 用户名 系统生成

  @Column({ nullable: true })
  nickname: string; // 昵称

  @OneToOne(() => AdminPassword, (admin) => admin.admin)
  password: AdminPassword; // 用户密码

  @Column({
    type: 'boolean',
    name: 'is_ban',
    default: false,
  })
  isBan: boolean; // 是否被禁用

  @Column({
    type: 'tinyint',
    name: 'role',
    default: 2, // 1: 管理员 2: 讲师
  })
  role: number;
}
