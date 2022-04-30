import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiParam } from '@nestjs/swagger';
import { BackendApi } from 'src/auth/guard';
import Ability from 'src/constanst/ability';
import TrainingCategory, { getCategoryByKey } from 'src/constanst/trainingCategory';
import { BatchRemoveDTO, CreateCourseDTO } from './course.dto';
import { CourseService } from './course.service';

@Controller('courses')
export class CourseController {
    constructor(private readonly courseService: CourseService) {}

    @Get('/list')
    @BackendApi()
    @ApiOperation({ summary: '获取用户列表' })
    @ApiParam({
        name: 'categoryKey',
        required: true,
        description: '分类'
    })
    @ApiParam({
        name: 'courseName',
        required: false,
        description: '课程名称'
    })
    async getListByPager(
        @Query('page') page: number,
        @Query('pageSize') pageSize: number,
        @Query('categoryKey') categoryKey: string,
        @Query('courseName') courseName: string,
    ) {
        const result = await this.courseService.findListByPagination({
            page,
            pageSize,
            categoryKey,
            courseName,
        });

        return {
            ...result,
            list: result.list.map((item) => {
                const category = getCategoryByKey(item.categoryKey) ?? {};
                return {
                    ...item,
                    category,
                    categoryName: category.name
                }
            })
        };
    }

    @Get('/listByCategory')
    @ApiOperation({ summary: '通过分类获取所有列表'})
    @ApiParam({
        name: 'categoryKey',
        required: true,
        description: '分类'
    })
    async getAllList(
        @Query('categoryKey') categoryKey: string,
    ) {
        const result = await this.courseService.findListByCategory({
            categoryKey,
        });

        return result.map((item) => {
            const category = getCategoryByKey(item.categoryKey) ?? {};
            return {
                ...item,
                category,
                categoryName: category.name
            }
        });
    }

    @Delete('/batch')
    @BackendApi()
    @ApiOperation({ summary: '删除' })
    async batchRemove(@Body() dto: BatchRemoveDTO) {
        await this.courseService.batchRemoveCourse(dto.ids);

        return dto.ids;
    }

    @Post('/createOne')
    @BackendApi()
    @ApiOperation({ summary: '新增课程' })
    async createOne(@Body() dto: CreateCourseDTO) {
        const one = await this.courseService.createOneCourse(dto);

        return one;
    }
    
    @Get('/ability/category')
    @BackendApi()
    @ApiOperation({ summary: '获取能力总表' })
    async getAllAbilityCategory() {
        return Ability;
    }

    @Get('/training/category')
    @BackendApi()
    @ApiOperation({ summary: '获取培训分类' })
    async getTrainingCategory() {
        return {
            trainingCategory: TrainingCategory,
        };
    }

    @Get('/training/second/category')
    @BackendApi()
    @ApiOperation({ summary: '获取所有二级分类' })
    async getAllSecondTrainingItems (@Query('keywords') keywords: string) {
        let list = [];
        TrainingCategory.map((item) => {
            list = [...list, ...(item.children ?? [])] as any;
        });

        const filter = (list: any[], kwds: string) => {
            return list.filter((item: any) => {
                const isKeep = item?.name?.includes(kwds);
                if (isKeep && item?.children && item?.children?.length) {
                    item.children = filter(item?.children, kwds);
                }
                return isKeep;
            });
        }

        if (keywords) {
            return filter(list, keywords);
        }
        
        return list;
    };
}