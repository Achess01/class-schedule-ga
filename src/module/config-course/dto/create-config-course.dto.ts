import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateConfigCourseDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  configCourseId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  scheduleConfigId: number;

  @ApiProperty({ example: 1201 })
  @IsInt()
  @Min(1)
  courseCode: number;

  @ApiProperty({ example: 2 })
  @IsInt()
  @Min(1)
  sectionQty: number;

  @ApiProperty({ example: '2026-03-15T09:00:00.000Z' })
  @IsDateString()
  scheduleTime: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  requireClassroom: boolean;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @IsBoolean()
  isFixed?: boolean;

  @ApiPropertyOptional({ example: 0, description: '0=CLASS, 1=LAB1, 2=LAB2' })
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(2)
  fixedDayIndex?: number;

  @ApiPropertyOptional({ example: 3 })
  @IsOptional()
  @IsInt()
  @Min(0)
  fixedStartSlot?: number;

  @ApiProperty({ example: 'MORNING' })
  @IsString()
  @MaxLength(255)
  typeOfSchedule: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  configClassroomId?: number;
}
