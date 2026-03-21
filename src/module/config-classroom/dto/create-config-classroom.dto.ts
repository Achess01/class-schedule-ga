import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsInt, IsString, MaxLength, Min } from 'class-validator';

export class CreateConfigClassroomDto {
  @ApiProperty({ example: 101 })
  @IsInt()
  @Min(1)
  classroomId: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  scheduleConfigId: number;

  @ApiProperty({ example: 'MORNING' })
  @IsString()
  @MaxLength(255)
  typeOfSchedule: string;

  @ApiProperty({ example: 'CLASS', enum: ['CLASS', 'LAB', 'BOTH'] })
  @IsString()
  @IsIn(['CLASS', 'LAB', 'BOTH'])
  classroomType: 'CLASS' | 'LAB' | 'BOTH';
}
