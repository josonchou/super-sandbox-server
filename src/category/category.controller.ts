import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';
import { BackendApi } from 'src/auth/guard';
import { EditCourseDTO } from './category.dto';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post('/edit')
  @BackendApi()
  @ApiOperation({ summary: '修改分类' })
  async editCategory(@Body() dto: EditCourseDTO) {
    const editResult = await this.categoryService.editCategory(
      dto.name,
      dto.code,
      dto.cid,
      dto.cateType,
    );

    return {
      category: editResult,
    };
  }
}
