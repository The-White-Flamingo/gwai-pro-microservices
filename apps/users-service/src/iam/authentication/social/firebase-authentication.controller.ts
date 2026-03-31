import { Body, Controller, Post } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FirebaseAuthenticationService } from './firebase-authentication.service';
import { FirebaseTokenDto } from '../dto/firebase-token.dto';
import { Auth } from '../decorators/auth.decorator';
import { AuthType } from '../enums/auth-type.enum';

@Auth(AuthType.None)
@Controller('auth/firebase')
export class FirebaseAuthenticationController {
  constructor(
    private readonly firebaseAuthenticationService: FirebaseAuthenticationService,
  ) {}

  @Post()
  authenticate(@Body() tokenDto: FirebaseTokenDto) {
    return this.firebaseAuthenticationService.authenticate(tokenDto.token);
  }

  @MessagePattern('auth.firebase')
  authenticateMessage(@Payload() tokenDto: FirebaseTokenDto) {
    return this.firebaseAuthenticationService.authenticate(tokenDto.token);
  }
}
