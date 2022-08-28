import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { Category } from './category.entity';

export class EditCourseDTO {
  @ApiProperty({
    description: '分类ID',
    required: true,
  })
  @IsNotEmpty()
  @IsNumber()
  cid: number;

  @ApiProperty({
    description: '分类类型',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  cateType: Category['cateType'];

  @ApiProperty({
    description: '分类名',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: '编号',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  code: string;
}
