import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsInt, Min } from 'class-validator';

export class CreateTimeSlotDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  timeSlotId: number;

  @ApiProperty({ example: '2026-03-15T07:00:00.000Z' })
  @IsDateString()
  startTime: string;

  @ApiProperty({ example: '2026-03-15T07:50:00.000Z' })
  @IsDateString()
  endTime: string;
}
