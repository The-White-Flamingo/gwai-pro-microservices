import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WaitlistService } from './waitlist.service';
import { CreateWaitlistDto } from '@app/shared';
import { Auth, AuthType } from '@app/iam';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('waitlist')
@Controller('waitlist')
export class WaitlistController {
  constructor(private readonly waitlistService: WaitlistService) {}

  @Auth(AuthType.None)
  @ApiBearerAuth()
  @Post()
  create(@Body() createWaitlistDto: CreateWaitlistDto) {
    return this.waitlistService.create(createWaitlistDto);
  }

  @Get()
  findAll() {
    return this.waitlistService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.waitlistService.findOne(+id);
  }
}
