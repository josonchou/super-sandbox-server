import { CommonEntity } from 'src/common/common.entity';
import { Column, Entity } from 'typeorm';

@Entity('category')
export class Category extends CommonEntity {
  @Column({
    name: 'name',
  })
  name: string;

  @Column({
    name: 'code',
  })
  code: string;

  @Column({
    name: 'cid',
  })
  cid: number;

  @Column({
    name: 'sort',
  })
  sort: number;

  @Column({
    name: 'parent_cid',
  })
  parentCid: number;

  @Column({
    name: 'cate_type',
  })
  cateType: 'ability' | 'training';

  @Column({
    name: 'kind',
  })
  kind: string;
}
