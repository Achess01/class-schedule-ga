import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsInt, Min } from 'class-validator';

export class CreateCourseCareerDto {
  @ApiProperty({ example: 1201 })
  @IsInt()
  @Min(1)
  courseCode: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  careerCode: number;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  semester: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isMandatory: boolean;
}
