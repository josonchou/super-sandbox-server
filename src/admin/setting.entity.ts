import { CommonEntity } from 'src/common/common.entity';
import { Column, Entity } from 'typeorm';

@Entity('settings')
export class Setting extends CommonEntity {
  @Column({ nullable: false })
  name: string;

  @Column()
  value: string;

  @Column()
  description: string;
}
