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
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../../auth/auth.service';
import { CareerService } from './career.service';
import { CreateCareerDto } from './dto/create-career.dto';
import { UpdateCareerDto } from './dto/update-career.dto';

@ApiTags('careers')
@Controller('careers')
export class CareerController {
  constructor(private readonly careerService: CareerService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Create a career' })
  @ApiCreatedResponse({
    description: 'Career created successfully',
    schema: {
      example: {
        careerCode: 1,
        name: 'Computer Science',
        createdBy: '12',
        active: true,
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Post()
  async create(@Body() createCareerDto: CreateCareerDto, @Req() req: Request) {
    const payload = req['user'] as JwtPayload;
    return this.careerService.create(createCareerDto, payload.sub);
  }

  @ApiOperation({ summary: 'Get all careers' })
  @ApiOkResponse({
    description: 'Careers fetched successfully',
    schema: {
      example: [
        {
          careerCode: 1,
          name: 'Computer Science',
          active: true,
        },
      ],
    },
  })
  @Get()
  async findAll() {
    return this.careerService.findAll();
  }

  @ApiOperation({ summary: 'Get one career by code' })
  @ApiOkResponse({
    description: 'Career fetched successfully',
    schema: {
      example: {
        careerCode: 1,
        name: 'Computer Science',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Career not found' })
  @Get(':careerCode')
  async findOne(@Param('careerCode', ParseIntPipe) careerCode: number) {
    return this.careerService.findOne(careerCode);
  }

  @ApiOperation({ summary: 'Update a career by code' })
  @ApiOkResponse({
    description: 'Career updated successfully',
    schema: {
      example: {
        careerCode: 1,
        name: 'Computer Science - Updated',
        updatedBy: '12',
        active: true,
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Career not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Patch(':careerCode')
  async update(
    @Param('careerCode', ParseIntPipe) careerCode: number,
    @Body() updateCareerDto: UpdateCareerDto,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.careerService.update(careerCode, updateCareerDto, payload.sub);
  }

  @ApiOperation({ summary: 'Delete a career by code' })
  @ApiOkResponse({
    description: 'Career deleted successfully',
    schema: {
      example: {
        careerCode: 1,
        active: false,
        updatedBy: '12',
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Career not found' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Delete(':careerCode')
  async remove(
    @Param('careerCode', ParseIntPipe) careerCode: number,
    @Req() req: Request,
  ) {
    const payload = req['user'] as JwtPayload;
    return this.careerService.remove(careerCode, payload.sub);
  }
}
