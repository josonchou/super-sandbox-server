/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class CommonEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @CreateDateColumn({
    name: 'create_at',
  })
  readonly createAt: Date;

  @UpdateDateColumn({
    name: 'update_at',
  })
  readonly updateAt: Date;

  @DeleteDateColumn({
    name: 'delete_at',
  })
  readonly deleteAt: Date;

  constructor(id?: number) {
    if (id) {
      this.id = id;
    }
  }
}
