import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @MessagePattern('auth.signUp')
  async signUp(@Payload() signUpDto: SignUpDto) {
    return this.authenticationService.signUp(signUpDto);
  }

  @MessagePattern('auth.signIn')
  signIn(@Payload() signInDto: SignInDto) {
    return this.authenticationService.signIn(signInDto);
  }

  @MessagePattern('auth.refreshTokens')
  refreshTokens(@Payload() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.refreshTokens(refreshTokenDto);
  }
}
