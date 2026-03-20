import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, Min } from 'class-validator';

export class UpdateGeneratedScheduleItemDto {
  @ApiPropertyOptional({ example: 0, description: '0=CLASS, 1=LAB1, 2=LAB2' })
  @IsOptional()
  @IsInt()
  @Min(0)
  dayIndex?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsInt()
  @Min(0)
  startSlot?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  periodCount?: number;

  @ApiPropertyOptional({ example: 3, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  configClassroomId?: number | null;

  @ApiPropertyOptional({ example: 2, nullable: true })
  @IsOptional()
  @IsInt()
  @Min(1)
  configProfessorId?: number | null;
}
