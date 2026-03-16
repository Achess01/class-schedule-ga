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
import { CourseCareerService } from './course-career.service';
import { CreateCourseCareerDto } from './dto/create-course-career.dto';
import { UpdateCourseCareerDto } from './dto/update-course-career.dto';

@ApiTags('course-careers')
@Controller('course-careers')
export class CourseCareerController {
  constructor(private readonly service: CourseCareerService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a course career relation' })
  @ApiCreatedResponse({
    description: 'Course career relation created successfully',
    schema: {
      example: {
        id: 1,
        courseCode: 1201,
        careerCode: 1,
        semester: 4,
        isMandatory: true,
        createdBy: '12',
        active: true,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Post()
  async create(@Body() createDto: CreateCourseCareerDto, @Req() req: Request) {
    const payload = req['user'] as JwtPayload;
    return this.service.create(createDto, payload.sub);
  }

  @ApiOperation({ summary: 'Get all course career relations' })
  @ApiOkResponse({
    description: 'Course career relations fetched successfully',
    schema: {
      example: [
        {
          id: 1,
          courseCode: 1201,
          careerCode: 1,
          active: true,
        },
      ],
    },
  })
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Get one course career relation by id' })
  @ApiOkResponse({
    description: 'Course career relation fetched successfully',
    schema: {
      example: {
        id: 1,
        courseCode: 1201,
        careerCode: 1,
        semester: 4,
        isMandatory: true,
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Course career relation not found' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a course career relation by id' })
  @ApiOkResponse({
    description: 'Course career relation updated successfully',
    schema: {
      example: {
        id: 1,
        semester: 5,
        updatedBy: '12',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Course career relation not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Patch(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateCourseCareerDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.service.update(id, updateDto, payload.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete a course career relation by id' })
  @ApiOkResponse({
    description: 'Course career relation deleted successfully',
    schema: {
      example: {
        id: 1,
        active: false,
        updatedBy: '12',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Course career relation not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const payload = req['user'] as JwtPayload;
    return this.service.remove(id, payload.sub);
  }
}
