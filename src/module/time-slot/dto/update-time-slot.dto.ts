import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateTimeSlotDto } from './create-time-slot.dto';

export class UpdateTimeSlotDto extends PartialType(CreateTimeSlotDto) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
