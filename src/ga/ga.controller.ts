import {
  Controller,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GaService } from './ga.service';

@ApiTags('ga')
@Controller('ga')
export class GaController {
  constructor(private readonly gaService: GaService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Generate schedule using GA for a schedule config',
  })
  @ApiOkResponse({
    description: 'GA execution completed successfully',
    schema: {
      example: {
        chromosomeId: 'gen-100-0',
        scheduleConfigId: '1',
        fitness: 0.0012,
        hardPenalty: 0,
        feasibilityPenalty: 600,
        softPenalty: 50,
        metrics: {
          requiredGeneCount: 40,
          assignedGeneCount: 35,
          unassignedClassroomCount: 3,
          unassignedProfessorCount: 1,
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Schedule config not found' })
  @ApiUnauthorizedResponse({
    description: 'Missing or invalid authorization token',
  })
  @Post('generate/:scheduleConfigId')
  async generate(
    @Param('scheduleConfigId', ParseIntPipe) scheduleConfigId: number,
  ) {
    return this.gaService.generate(scheduleConfigId);
  }
}
