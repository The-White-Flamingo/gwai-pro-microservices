import {
  ActiveUser,
  ActiveUserData,
  Auth,
  AuthType,
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
} from '@app/iam';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  Get,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
// import reset and forgot password dtos
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
  constructor(private readonly authenticationService: AuthService) {}

  @Post('sign-up')
  @UseInterceptors(FileInterceptor('avatar'))
  signUp(
    @Body() signUpDto: SignUpDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    // signUpDto.avatar = file?.buffer.toString('base64');

    return this.authenticationService.signUp(signUpDto);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authenticationService.signIn(signInDto);
  }

  // verify email address
  @Get('verify-email')
  verifyEmail(@Query('token') token: string) {
    return this.authenticationService.verifyEmail(token);
  }

  // forgot password and reset password endpoints
  @Post('forgot-password')
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authenticationService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authenticationService.resetPassword(resetPasswordDto);
  }

  // resend verification email
  @Post('resend-verification')
  resendVerificationEmail(@Body('email') email: string) {
    return this.authenticationService.resendVerificationEmail(email);
  }

  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.refreshTokens(refreshTokenDto);
  }

  // endpoint to get the profile completion status of the user
  @ApiBearerAuth()
  @Auth(AuthType.Bearer)
  @Get('profile-status')
  getProfileStatus(@ActiveUser() activeUser: ActiveUserData) {
    return this.authenticationService.getProfileStatus(activeUser.sub);
  }

  // @ApiBearerAuth()
  // @Auth(AuthType.Bearer)
  // @HttpCode(HttpStatus.OK)
  // @Post('2fa/generate')
  // async generateQrCode(
  //   @ActiveUser() activeUser: ActiveUserData,
  //   @Res() response: Response,
  // ) {}
}
