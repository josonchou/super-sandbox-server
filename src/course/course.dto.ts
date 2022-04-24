import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateCourseDTO {
    @ApiProperty({
        description: '课程名称',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    courseName: string;

    @ApiProperty({
        description: '文件UUID',
        required: true,
    })
    @IsNotEmpty()
    @IsString()
    fileUUID: string;
}

export class BatchRemoveDTO {
    @ApiProperty({
      description: 'ID列表',
      required: true,
    })
    @IsNotEmpty()
    @IsArray()
    ids: number[];
  }