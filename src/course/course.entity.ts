import { CommonEntity } from 'src/common/common.entity';
import { Column, Entity } from 'typeorm';

@Entity('courses')
export class Course extends CommonEntity {
    @Column({
        name: 'course_name',
    })
    courseName: string;

    @Column({
        name: 'file_uuid',
    })
    fileUUID: string;

    @Column({
        name: 'category_key',
    })
    categoryKey: string;

    @Column({
        name: 'course_type',
    })
    courseType: string;
}