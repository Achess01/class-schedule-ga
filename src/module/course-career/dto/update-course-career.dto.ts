import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateCourseCareerDto } from './create-course-career.dto';

export class UpdateCourseCareerDto extends PartialType(CreateCourseCareerDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
