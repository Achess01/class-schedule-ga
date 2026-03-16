import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsInt, IsOptional, IsString, MaxLength, Min } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({ example: 1201 })
  @IsInt()
  @Min(1)
  courseCode: number;

  @ApiProperty({ example: 'Algorithms' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiPropertyOptional({ example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  semester?: number;

  @ApiProperty({ example: true })
  @IsBoolean()
  isMandatory: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  hasLab: boolean;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  numberOfPeriods: number;

  @ApiProperty({ example: 'MORNING' })
  @IsString()
  @MaxLength(255)
  typeOfSchedule: string;
}
