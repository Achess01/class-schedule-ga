import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength, Min } from 'class-validator';

export class CreateClassroomDto {
  @ApiProperty({ example: 'A-101' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'Laboratory, Classroom' })
  @IsInt()
  @Min(1)
  classTypeId: number;

  @ApiProperty({ example: 40 })
  @IsInt()
  @Min(1)
  capacity: number;

  @ApiProperty({ example: 'MORNING, AFTERNOON, NIGHT' })
  @IsString()
  @MaxLength(255)
  typeOfSchedule: string;
}
