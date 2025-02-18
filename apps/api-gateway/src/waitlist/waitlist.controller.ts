import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistDto } from '@app/shared';
import { Auth, AuthType } from '@app/iam';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('witlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Auth(AuthType.None)
  @Post()
  create(@Body() createWaitlistDto: CreateWaitlistDto) {
    return this.waitlistService.create(createWaitlistDto);
  }

  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.waitlistService.findAll();
  }

  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.waitlistService.findOne(+id);
  }
}
