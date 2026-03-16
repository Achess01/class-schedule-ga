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
import { CreateProfessorDto } from './dto/create-professor.dto';
import { UpdateProfessorDto } from './dto/update-professor.dto';
import { ProfessorService } from './professor.service';

@ApiTags('professors')
@Controller('professors')
export class ProfessorController {
  constructor(private readonly professorService: ProfessorService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a professor' })
  @ApiCreatedResponse({
    description: 'Professor created successfully',
    schema: {
      example: {
        professorCode: 1001,
        firstName: 'Ana',
        lastName: 'López',
        entryTime: '2026-03-15T07:00:00.000Z',
        exitTime: '2026-03-15T15:00:00.000Z',
        createdBy: '12',
        active: true,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Post()
  async create(@Body() createProfessorDto: CreateProfessorDto, @Req() req: Request) {
    const payload = req['user'] as JwtPayload;
    return this.professorService.create(createProfessorDto, payload.sub);
  }

  @ApiOperation({ summary: 'Get all professors' })
  @ApiOkResponse({
    description: 'Professors fetched successfully',
    schema: {
      example: [
        {
          professorCode: 1001,
          firstName: 'Ana',
          lastName: 'López',
          active: true,
        },
      ],
    },
  })
  @Get()
  async findAll() {
    return this.professorService.findAll();
  }

  @ApiOperation({ summary: 'Get one professor by code' })
  @ApiOkResponse({
    description: 'Professor fetched successfully',
    schema: {
      example: {
        professorCode: 1001,
        firstName: 'Ana',
        secondName: 'María',
        lastName: 'López',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Professor not found' })
  @Get(':professorCode')
  async findOne(@Param('professorCode', ParseIntPipe) professorCode: number) {
    return this.professorService.findOne(professorCode);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a professor by code' })
  @ApiOkResponse({
    description: 'Professor updated successfully',
    schema: {
      example: {
        professorCode: 1001,
        firstName: 'Ana',
        lastName: 'López',
        updatedBy: '12',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Professor not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Patch(':professorCode')
  async update(
    @Param('professorCode', ParseIntPipe) professorCode: number,
    @Body() updateProfessorDto: UpdateProfessorDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.professorService.update(professorCode, updateProfessorDto, payload.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete a professor by code' })
  @ApiOkResponse({
    description: 'Professor deleted successfully',
    schema: {
      example: {
        professorCode: 1001,
        active: false,
        updatedBy: '12',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Professor not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Delete(':professorCode')
  async remove(@Param('professorCode', ParseIntPipe) professorCode: number, @Req() req: Request) {
    const payload = req['user'] as JwtPayload;
    return this.professorService.remove(professorCode, payload.sub);
  }
}
