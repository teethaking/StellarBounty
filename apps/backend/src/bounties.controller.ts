import { Body, Controller, Delete, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { BountiesService } from './bounties.service';
import { CreateBountyDto, UpdateBountyDto } from './bounties/dto/bounty.dto';

@ApiTags('bounties')
@Controller('bounties')
export class BountiesController {
  constructor(private readonly bountiesService: BountiesService) {}

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Create a new bounty' })
  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: CreateBountyDto) {
    return this.bountiesService.create(dto);
  }

  @ApiOperation({ summary: 'List all bounties' })
  @Get()
  findAll() {
    return this.bountiesService.findAll();
  }

  @ApiOperation({ summary: 'Get a single bounty by ID' })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.bountiesService.findOne(id);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a bounty' })
  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateBountyDto) {
    return this.bountiesService.update(id, dto);
  }

  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a bounty' })
  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.bountiesService.remove(id);
  }
}
