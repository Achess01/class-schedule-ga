import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request } from 'express';
import type { JwtPayload } from '../../auth/auth.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { ClassroomService } from './classroom.service';

@ApiTags('classrooms')
@Controller('classrooms')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a classroom' })
  @ApiCreatedResponse({
    description: 'Classroom created successfully',
    schema: {
      example: {
        classroomId: 101,
        name: 'A-101',
        capacity: 40,
        type: 'THEORY',
        createdBy: '12',
        active: true,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Post()
  async create(@Body() createClassroomDto: CreateClassroomDto, @Req() req: Request) {
    const payload = req['user'] as JwtPayload;
    return this.classroomService.create(createClassroomDto, payload.sub);
  }

  @ApiOperation({ summary: 'Get all classrooms' })
  @ApiOkResponse({
    description: 'Classrooms fetched successfully',
    schema: {
      example: [
        {
          classroomId: 101,
          name: 'A-101',
          capacity: 40,
          type: 'THEORY',
          active: true,
        },
      ],
    },
  })
  @Get()
  async findAll() {
    return this.classroomService.findAll();
  }

  @ApiOperation({ summary: 'Get one classroom by id' })
  @ApiOkResponse({
    description: 'Classroom fetched successfully',
    schema: {
      example: {
        classroomId: 101,
        name: 'A-101',
        capacity: 40,
        type: 'THEORY',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Classroom not found' })
  @Get(':classroomId')
  async findOne(@Param('classroomId', ParseIntPipe) classroomId: number) {
    return this.classroomService.findOne(classroomId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a classroom by id' })
  @ApiOkResponse({
    description: 'Classroom updated successfully',
    schema: {
      example: {
        classroomId: 101,
        name: 'A-101',
        capacity: 45,
        type: 'THEORY',
        updatedBy: '12',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Classroom not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Patch(':classroomId')
  async update(
    @Param('classroomId', ParseIntPipe) classroomId: number,
    @Body() updateClassroomDto: UpdateClassroomDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.classroomService.update(classroomId, updateClassroomDto, payload.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete a classroom by id' })
  @ApiOkResponse({
    description: 'Classroom deleted successfully',
    schema: {
      example: {
        classroomId: 101,
        active: false,
        updatedBy: '12',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Classroom not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Delete(':classroomId')
  async remove(@Param('classroomId', ParseIntPipe) classroomId: number, @Req() req: Request) {
    const payload = req['user'] as JwtPayload;
    return this.classroomService.remove(classroomId, payload.sub);
  }
}
