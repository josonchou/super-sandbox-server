import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BadReqException } from 'src/common/BadReqException';
import { CommonQuery } from 'src/common/CommonQuery';
import { genPaginationParams } from 'src/common/utils';
import { File } from 'src/file/file.entity';
import { Repository } from 'typeorm';
import { CreateCourseDTO } from './course.dto';
import { Course } from './course.entity';

@Injectable()
export class CourseService {
    constructor(
        @InjectRepository(Course)
        private readonly courseRepository: Repository<Course>,

        @InjectRepository(File)
        private readonly fileRepository: Repository<File>,
    ) {}

    // 分页获取列表
    async findListByPagination(query?: CommonQuery) {
        const { offset, limit, page, pageSize } = genPaginationParams(query as any);

        let queryBuilder = this.courseRepository
            .createQueryBuilder('course')
            .where('course.delete_at IS NULL');
            

        if (query.categoryKey) {
            queryBuilder.andWhere('course.categoryKey = :categoryKey', {
                categoryKey: query.categoryKey,
            });
        }

        if (query.courseName) {
            queryBuilder.andWhere('course.courseName LIKE :keywords', {
                keywords: `%${query.courseName}%`
            });
        }

        const total = await queryBuilder.getCount();
        queryBuilder = queryBuilder
            .offset(offset)
            .limit(limit)
            .orderBy('course.createAt', 'DESC');
        const list = await queryBuilder.getMany();

        return {
            list,
            total,
            page,
            pageSize,
        };
    }
    

    async findListByCategory(query?: CommonQuery) {
        const list = await this.courseRepository
            .createQueryBuilder('course')
            .where('course.delete_at IS NULL')
            .andWhere('course.categoryKey = :categoryKey', {
                categoryKey: query.categoryKey,
            })
            .orderBy('course.createAt', 'DESC')
            .getMany();

        return list;
    }

    async createOneCourse(dto: CreateCourseDTO) {
        const foundFile = await this.fileRepository.findOne({
            where: {
                uuid: dto.fileUUID,
            }
        });

        if (!foundFile || !foundFile.id) {
            throw new BadReqException('不存在该文件');
        }

        if (!foundFile.fileType) {
            throw new BadReqException('文件格式错误');
        }
        const course = new Course();

        course.courseName = dto.courseName;
        course.fileUUID = dto.fileUUID;
        course.courseType = foundFile.fileType;
        course.categoryKey = dto.categoryKey;

        const result = await this.courseRepository.save(course);

        return result;
    }

    // 批量删除课程
    async batchRemoveCourse(ids: number[]) {
        await this.courseRepository.delete(ids);
    }
}