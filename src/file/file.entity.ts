/*
 * @description:
 * @author: 周金顺（云天河）
 * @copyright:  © 2021
 */

import { CommonEntity } from 'src/common/common.entity';
import { Column, Entity, Index } from 'typeorm';

@Entity('files')
export class File extends CommonEntity {
  @Column()
  filename: string;

  @Column({ name: 'origin_path' })
  originPath: string;

  @Column()
  path: string;

  @Column()
  @Index({
    unique: true,
  })
  uuid: string;

  @Column()
  size: number;

  @Column()
  encoding: string;

  @Column({ name: 'origin_filename' })
  originFilename: string;

  @Column({ name: 'host' })
  host: string;


  @Column({ name: 'fileType' })
  fileType: string;

  @Column({ name: 'mimetype' })
  mimetype: string;

  @Column({ name: 'hash' })
  hash: string;

  toJSON() {
    let host = 'wx.jiangqiu.com';
    if (this.host) {
      host = this.host;
    }
    return {
      ...this,
      path: `http://${host}/srv/files/view/${this.uuid}`,
    };
  }
}
