import { CommonEntity } from 'src/common/common.entity';
import { Column, Entity, JoinColumn, OneToOne } from 'typeorm';
import { Admin } from './admin.entity';

/**
 * @description: 管理员密码
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */
@Entity({
  name: 'admin_passwords',
})
export class AdminPassword extends CommonEntity {
  @Column({
    nullable: false,
    length: 256,
  })
  password: string;

  @OneToOne(() => Admin, (admin) => admin.password, {
    onDelete: 'CASCADE',
    eager: true,
  })
  @JoinColumn()
  admin: Admin;
}
