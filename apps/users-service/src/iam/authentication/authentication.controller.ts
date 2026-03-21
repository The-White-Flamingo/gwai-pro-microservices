import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
// import the forgot password and reset password DTOs
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

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

  // add an endpoint to verify email addresses
  @MessagePattern('auth.verifyEmail')
  verifyEmail(@Payload() payload: { token: string }) {
    return this.authenticationService.verifyEmail(payload.token);
  }

  @MessagePattern('auth.resendVerificationEmail')
  resendVerificationEmail(@Payload() payload: { email: string }) {
    return this.authenticationService.resendVerificationEmail(payload.email);
  }

  // authentication.controller.ts (users-service)
  @MessagePattern('auth.profileStatus')
  getProfileStatus(@Payload() payload: { userId: string }) {
    return this.authenticationService.getProfileStatus(payload.userId);
  }

  // add endpoints for forgot password and reset password
  @MessagePattern('auth.forgotPassword')
  forgotPassword(@Payload() payload: { email: string }) {
    return this.authenticationService.forgotPassword(payload.email);
  }

  @MessagePattern('auth.resetPassword')
  resetPassword(@Payload() payload: ResetPasswordDto) {
    return this.authenticationService.resetPassword(payload.token, payload.newPassword);
  }
}
