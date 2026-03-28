import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { VerifySignUpOtpDto } from './dto/verify-sign-up-otp.dto';
import { ResendSignUpOtpDto } from './dto/resend-sign-up-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { RequestAuthOtpDto } from './dto/request-auth-otp.dto';
import { VerifyAuthOtpDto } from './dto/verify-auth-otp.dto';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

  @MessagePattern('auth.requestOtp')
  requestOtp(@Payload() requestAuthOtpDto: RequestAuthOtpDto) {
    return this.authenticationService.requestOtp(requestAuthOtpDto);
  }

  @MessagePattern('auth.verifyOtp')
  verifyOtp(@Payload() verifyAuthOtpDto: VerifyAuthOtpDto) {
    return this.authenticationService.verifyOtp(verifyAuthOtpDto);
  }

  @MessagePattern('auth.signUp')
  async signUp(@Payload() signUpDto: SignUpDto) {
    return this.authenticationService.signUp(signUpDto);
  }

  @MessagePattern('auth.verifySignUpOtp')
  verifySignUpOtp(@Payload() verifySignUpOtpDto: VerifySignUpOtpDto) {
    return this.authenticationService.verifySignUpOtp(verifySignUpOtpDto);
  }

  @MessagePattern('auth.resendSignUpOtp')
  resendSignUpOtp(@Payload() resendSignUpOtpDto: ResendSignUpOtpDto) {
    return this.authenticationService.resendSignUpOtp(resendSignUpOtpDto);
  }

  @MessagePattern('auth.signIn')
  signIn(@Payload() signInDto: SignInDto) {
    return this.authenticationService.signIn(signInDto);
  }

  @MessagePattern('auth.refreshTokens')
  refreshTokens(@Payload() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.refreshTokens(refreshTokenDto);
  }

  @MessagePattern('auth.forgotPassword')
  forgotPassword(@Payload() forgotPasswordDto: ForgotPasswordDto) {
    return this.authenticationService.forgotPassword(forgotPasswordDto);
  }

  @MessagePattern('auth.resetPassword')
  resetPassword(@Payload() resetPasswordDto: ResetPasswordDto) {
    return this.authenticationService.resetPassword(resetPasswordDto);
  }
}
