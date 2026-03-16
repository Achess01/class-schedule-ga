import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateConfigCourseDto } from './create-config-course.dto';

export class UpdateConfigCourseDto extends PartialType(CreateConfigCourseDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
