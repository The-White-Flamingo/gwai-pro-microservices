import {
  ActiveUser,
  ActiveUserData,
  Auth,
  AuthType,
  ForgotPasswordDto,
  ResendSignUpOtpDto,
  ResetPasswordDto,
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  VerifySignUpOtpDto,
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
// import reset and forgot password dtos
// import { ForgotPasswordDto } from './dto/forgot-password.dto';
// import { ResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('auth')
@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
  constructor(private readonly authenticationService: AuthService) {}

  @Post('sign-up')
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiOperation({
    summary: 'Request sign-up OTP',
    description:
      'Creates or updates a pending signup and sends a 6-digit OTP to email.',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['email', 'password', 'role'],
      properties: {
        email: { type: 'string', format: 'email', example: 'jane@example.com' },
        password: { type: 'string', example: 'StrongPass123!' },
        role: {
          type: 'string',
          enum: ['Client', 'Musician', 'Studio', 'Admin'],
          example: 'Client',
        },
      },
    },
    examples: {
      clientSignUp: {
        summary: 'Client signup request',
        value: {
          email: 'jane@example.com',
          password: 'StrongPass123!',
          role: 'Client',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'OTP sent successfully',
    schema: {
      example: {
        status: true,
        message: 'OTP sent to email. Verify OTP to complete sign up.',
      },
    },
  })
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

  @Post('verify-sign-up-otp')
  @ApiOperation({
    summary: 'Verify signup OTP',
    description: 'Validates OTP and creates the user account.',
  })
  @ApiBody({
    type: VerifySignUpOtpDto,
    examples: {
      verifyOtp: {
        summary: 'Verify OTP',
        value: { email: 'jane@example.com', otp: '123456' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'User created after successful OTP verification',
    schema: {
      example: {
        status: true,
        message: 'Client signed up successfully',
      },
    },
  })
  verifySignUpOtp(@Body() verifySignUpOtpDto: VerifySignUpOtpDto) {
    return this.authenticationService.verifySignUpOtp(verifySignUpOtpDto);
  }

  @Post('resend-sign-up-otp')
  @ApiOperation({
    summary: 'Resend signup OTP',
    description: 'Sends a new OTP for a pending signup, subject to rate limits.',
  })
  @ApiBody({
    type: ResendSignUpOtpDto,
    examples: {
      resendOtp: {
        summary: 'Resend OTP',
        value: { email: 'jane@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'OTP resent successfully',
    schema: {
      example: {
        status: true,
        message: 'OTP resent successfully.',
      },
    },
  })
  resendSignUpOtp(@Body() resendSignUpOtpDto: ResendSignUpOtpDto) {
    return this.authenticationService.resendSignUpOtp(resendSignUpOtpDto);
  }

  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.refreshTokens(refreshTokenDto);
  }

  @Post('forgot-password')
  @ApiOperation({
    summary: 'Request password reset code',
    description: 'Sends a password reset code if the account exists.',
  })
  @ApiBody({
    type: ForgotPasswordDto,
    examples: {
      forgotPassword: {
        summary: 'Forgot password request',
        value: { email: 'jane@example.com' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Request accepted',
    schema: {
      example: {
        status: true,
        message:
          'If the email exists, a password reset code has been sent to it.',
      },
    },
  })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authenticationService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password using code',
    description: 'Resets account password after reset code verification.',
  })
  @ApiBody({
    type: ResetPasswordDto,
    examples: {
      resetPassword: {
        summary: 'Reset password request',
        value: {
          email: 'jane@example.com',
          otp: '123456',
          newPassword: 'N3wStrongPass!23',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Password reset successful',
    schema: {
      example: {
        status: true,
        message: 'Password reset successful. Please sign in again.',
      },
    },
  })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authenticationService.resetPassword(resetPasswordDto);
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
