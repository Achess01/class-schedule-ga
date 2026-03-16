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
import { ConfigProfessorService } from './config-professor.service';
import { CreateConfigProfessorDto } from './dto/create-config-professor.dto';
import { UpdateConfigProfessorDto } from './dto/update-config-professor.dto';

@ApiTags('config-professors')
@Controller('config-professors')
export class ConfigProfessorController {
  constructor(private readonly service: ConfigProfessorService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a config professor' })
  @ApiCreatedResponse({
    description: 'Config professor created successfully',
    schema: {
      example: {
        configProfessorId: 1,
        professorCode: 1001,
        scheduleConfigId: 1,
        createdBy: '12',
        active: true,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Post()
  async create(@Body() createDto: CreateConfigProfessorDto, @Req() req: Request) {
    const payload = req['user'] as JwtPayload;
    return this.service.create(createDto, payload.sub);
  }

  @ApiOperation({ summary: 'Get all config professors' })
  @ApiOkResponse({
    description: 'Config professors fetched successfully',
    schema: {
      example: [
        {
          configProfessorId: 1,
          professorCode: 1001,
          scheduleConfigId: 1,
          active: true,
        },
      ],
    },
  })
  @Get()
  async findAll() {
    return this.service.findAll();
  }

  @ApiOperation({ summary: 'Get one config professor by id' })
  @ApiOkResponse({
    description: 'Config professor fetched successfully',
    schema: {
      example: {
        configProfessorId: 1,
        professorCode: 1001,
        scheduleConfigId: 1,
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Config professor not found' })
  @Get(':configProfessorId')
  async findOne(@Param('configProfessorId', ParseIntPipe) configProfessorId: number) {
    return this.service.findOne(configProfessorId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Update a config professor by id' })
  @ApiOkResponse({
    description: 'Config professor updated successfully',
    schema: {
      example: {
        configProfessorId: 1,
        professorCode: 1002,
        updatedBy: '12',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Config professor not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Patch(':configProfessorId')
  async update(
    @Param('configProfessorId', ParseIntPipe) configProfessorId: number,
    @Body() updateDto: UpdateConfigProfessorDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.service.update(configProfessorId, updateDto, payload.sub);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Soft delete a config professor by id' })
  @ApiOkResponse({
    description: 'Config professor deleted successfully',
    schema: {
      example: {
        configProfessorId: 1,
        active: false,
        updatedBy: '12',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Config professor not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Delete(':configProfessorId')
  async remove(@Param('configProfessorId', ParseIntPipe) configProfessorId: number, @Req() req: Request) {
    const payload = req['user'] as JwtPayload;
    return this.service.remove(configProfessorId, payload.sub);
  }
}
