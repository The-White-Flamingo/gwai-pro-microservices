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
// apps/users-service/src/iam/authentication/authentication.controller.ts
// import { AdminSignInDto } from './dto/admin-sign-in.dto'; // or from @app/iam
import { AdminSignInDto} from '@app/iam';



@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService) {}

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

  // admin sign-in
  @MessagePattern('auth.adminSignIn')
  adminSignIn(@Payload() adminSignInDto: AdminSignInDto) {
    return this.authenticationService.adminSignIn(adminSignInDto);
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
