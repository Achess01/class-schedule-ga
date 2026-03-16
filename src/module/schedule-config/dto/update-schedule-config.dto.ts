import { PartialType, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';
import { CreateScheduleConfigDto } from './create-schedule-config.dto';

export class UpdateScheduleConfigDto extends PartialType(
  CreateScheduleConfigDto,
) {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  active?: boolean;
}
