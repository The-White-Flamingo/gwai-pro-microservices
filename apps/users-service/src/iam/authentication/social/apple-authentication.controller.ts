import { Body, Controller, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { AppleAuthenticationService } from './apple-authentication.service';
import { AppleTokenDto } from '../dto/apple-token.dto';
import { Auth } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('auth/apple')
export class AppleAuthenticationController {
  constructor(
    private readonly appleAuthenticationService: AppleAuthenticationService,
  ) {}

  @Post()
  authenticate(@Body() tokenDto: AppleTokenDto) {
    return this.appleAuthenticationService.authenticate(tokenDto.token);
  }

  @MessagePattern('auth.apple')
  authenticateMessage(@Payload() tokenDto: AppleTokenDto) {
    return this.appleAuthenticationService.authenticate(tokenDto.token);
  }
}
