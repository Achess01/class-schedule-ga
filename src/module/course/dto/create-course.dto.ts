import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

enum ScheduleType {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
  NIGHT = 'NIGHT',
  BOTH = 'BOTH',
}

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

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isCommonArea?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  isMandatory: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  hasLab: boolean;

  @ApiProperty({ example: 4 })
  @IsInt()
  @Min(1)
  @Max(7)
  numberOfPeriods: number;

  @ApiProperty({
    example: 'MORNING',
    enum: ['MORNING', 'AFTERNOON', 'NIGHT', 'BOTH'],
  })
  @IsEnum(ScheduleType)
  typeOfSchedule: string;
}
