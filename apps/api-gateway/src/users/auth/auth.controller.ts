import {
  ActiveUser,
  ActiveUserData,
  AppleTokenDto,
  Auth,
  AuthType,
  ForgotPasswordDto,
  GoogleTokenDto,
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

  @Post('google')
  @ApiOperation({
    summary: 'Authenticate with Google',
    description:
      'Accepts a Google ID token from the frontend, verifies it in users-service, stores or links the user in the users table, and returns access and refresh tokens.',
  })
  @ApiBody({
    type: GoogleTokenDto,
    examples: {
      googleAuth: {
        summary: 'Google ID token payload',
        value: {
          token:
            'eyJhbGciOiJSUzI1NiIsImtpZCI6Imdvb2dsZS1raWQiLCJ0eXAiOiJKV1QifQ.eyJlbWFpbCI6ImphbmVAZXhhbXBsZS5jb20iLCJzdWIiOiIxMjM0NTY3ODkwIiwiYXVkIjoieW91ci1nb29nbGUtY2xpZW50LWlkIiwiZW1haWxfdmVyaWZpZWQiOnRydWV9.signature',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Google authentication successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid Google token',
    schema: {
      example: {
        message: 'Invalid Google token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Users service timeout',
    schema: {
      example: {
        message: 'Request to users-service timed out for pattern auth.google',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  authenticateWithGoogle(@Body() googleTokenDto: GoogleTokenDto) {
    return this.authenticationService.authenticateWithGoogle(googleTokenDto);
  }

  @Post('apple')
  @ApiOperation({
    summary: 'Authenticate with Apple',
    description:
      'Accepts an Apple identity token from the frontend, verifies its signature and claims in users-service, stores or links the user in the users table, and returns access and refresh tokens.',
  })
  @ApiBody({
    type: AppleTokenDto,
    examples: {
      appleAuth: {
        summary: 'Apple identity token payload',
        value: {
          token:
            'eyJhbGciOiJSUzI1NiIsImtpZCI6IkFQUEtFWUlEIiwidHlwIjoiSldUIn0.eyJpc3MiOiJodHRwczovL2FwcGxlaWQuYXBwbGUuY29tIiwiYXVkIjoieW91ci5hcHAuYnVuZGxlLmlkIiwic3ViIjoiMDAxMjM0LjU2Nzg5YWJjZGVmIiwiZW1haWwiOiJqYW5lQHByaXZhdGVyZWxheS5hcHBsZWlkLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjoidHJ1ZSIsImV4cCI6MTc3NDA5OTk5OX0.signature',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Apple authentication successful',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid Apple token',
    schema: {
      example: {
        message: 'Invalid Apple token',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Users service timeout',
    schema: {
      example: {
        message: 'Request to users-service timed out for pattern auth.apple',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  authenticateWithApple(@Body() appleTokenDto: AppleTokenDto) {
    return this.authenticationService.authenticateWithApple(appleTokenDto);
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
