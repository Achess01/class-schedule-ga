import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateConfigCourseProfessorDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  configProfessorId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  configCourseId: number;
}
