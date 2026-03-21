import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsInt, IsOptional, Min } from 'class-validator';

export class CreateScheduleConfigDto {
  @ApiProperty({ example: 50 })
  @IsInt()
  @Min(1)
  periodDurationM: number;

  @ApiProperty({ example: '2026-03-15T07:00:00.000Z' })
  @IsDateString()
  morningStartTime: string;

  @ApiProperty({ example: '2026-03-15T12:00:00.000Z' })
  @IsDateString()
  morningEndTime: string;

  @ApiProperty({ example: '2026-03-15T13:00:00.000Z' })
  @IsDateString()
  afternoonStartTime: string;

  @ApiProperty({ example: '2026-03-15T18:00:00.000Z' })
  @IsDateString()
  afternoonEndTime: string;

  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxGeneration?: number;

  @ApiPropertyOptional({ example: 100 })
  @IsOptional()
  @IsInt()
  @Min(2)
  startPopulationSize?: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  selectionMethod: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  crossMethod: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  mutationMethod: number;
}
