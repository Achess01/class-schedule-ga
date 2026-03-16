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
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { CourseService } from './course.service';

@ApiTags('courses')
@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a course' })
  @ApiCreatedResponse({
    description: 'Course created successfully',
    schema: {
      example: {
        courseCode: 1201,
        name: 'Algorithms',
        semester: 4,
        isMandatory: true,
        hasLab: false,
        numberOfPeriods: 4,
        typeOfSchedule: 'MORNING',
        createdBy: '12',
        active: true,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Post()
  async create(@Body() createCourseDto: CreateCourseDto, @Req() req: Request) {
    const payload = req['user'] as JwtPayload;
    return this.courseService.create(createCourseDto, payload.sub);
  }

  @ApiOperation({ summary: 'Get all courses' })
  @ApiOkResponse({
    description: 'Courses fetched successfully',
    schema: {
      example: [
        {
          courseCode: 1201,
          name: 'Algorithms',
          active: true,
        },
      ],
    },
  })
  @Get()
  async findAll() {
    return this.courseService.findAll();
  }

  @ApiOperation({ summary: 'Get one course by code' })
  @ApiOkResponse({
    description: 'Course fetched successfully',
    schema: {
      example: {
        courseCode: 1201,
        name: 'Algorithms',
        semester: 4,
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @Get(':courseCode')
  async findOne(@Param('courseCode', ParseIntPipe) courseCode: number) {
    return this.courseService.findOne(courseCode);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a course by code' })
  @ApiOkResponse({
    description: 'Course updated successfully',
    schema: {
      example: {
        courseCode: 1201,
        name: 'Algorithms II',
        updatedBy: '12',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Patch(':courseCode')
  async update(
    @Param('courseCode', ParseIntPipe) courseCode: number,
    @Body() updateCourseDto: UpdateCourseDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.courseService.update(courseCode, updateCourseDto, payload.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete a course by code' })
  @ApiOkResponse({
    description: 'Course deleted successfully',
    schema: {
      example: {
        courseCode: 1201,
        active: false,
        updatedBy: '12',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Course not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Delete(':courseCode')
  async remove(@Param('courseCode', ParseIntPipe) courseCode: number, @Req() req: Request) {
    const payload = req['user'] as JwtPayload;
    return this.courseService.remove(courseCode, payload.sub);
  }
}
