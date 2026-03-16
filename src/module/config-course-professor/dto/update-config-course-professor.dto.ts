import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateConfigCourseProfessorDto } from './create-config-course-professor.dto';

export class UpdateConfigCourseProfessorDto extends PartialType(
  CreateConfigCourseProfessorDto,
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
