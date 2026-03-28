import {
  ActiveUser,
  ActiveUserData,
  AppleTokenDto,
  Auth,
  AuthType,
  ForgotPasswordDto,
  GoogleTokenDto,
  RequestAuthOtpDto,
  ResendSignUpOtpDto,
  ResetPasswordDto,
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  VerifyAuthOtpDto,
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
      required: ['email', 'username', 'phoneNumber'],
      properties: {
        email: { type: 'string', format: 'email', example: 'jane@example.com' },
        username: { type: 'string', example: 'jane_doe' },
        phoneNumber: { type: 'string', example: '+233201234567' },
      },
    },
    examples: {
      clientSignUp: {
        summary: 'New user OTP request',
        value: {
          email: 'jane@example.com',
          username: 'jane_doe',
          phoneNumber: '+233201234567',
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
        message: 'OTP sent successfully.',
        data: {
          email: 'jane@example.com',
          isNewUser: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload',
    schema: {
      example: {
        message: 'email, username and phoneNumber are required for new users',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User conflict',
    schema: {
      example: {
        message: 'Username already exists',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Users service timeout',
    schema: {
      example: {
        message: 'Request to users-service timed out for pattern auth.requestOtp',
        error: 'Gateway Timeout',
        statusCode: 504,
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
  @ApiOperation({
    summary: 'Request OTP for existing user',
    description:
      'Requests an authentication OTP for an existing user using email or username.',
  })
  @ApiBody({
    type: SignInDto,
    examples: {
      signInWithEmail: {
        summary: 'Sign in with email',
        value: { identifier: 'jane@example.com' },
      },
      signInWithUsername: {
        summary: 'Sign in with username',
        value: { identifier: 'jane_doe' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'OTP sent successfully',
    schema: {
      example: {
        status: true,
        message: 'OTP sent successfully.',
        data: {
          email: 'jane@example.com',
          isNewUser: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Identifier is invalid or user not found',
    schema: {
      example: {
        message: 'Provide at least an email or username',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Users service timeout',
    schema: {
      example: {
        message: 'Request to users-service timed out for pattern auth.requestOtp',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  signIn(@Body() signInDto: SignInDto) {
    return this.authenticationService.signIn(signInDto);
  }

  @Post('request-otp')
  @ApiOperation({
    summary: 'Request OTP for signup or signin',
    description:
      'Unified auth entrypoint. If the user exists, an OTP is sent for login. If not, a new user is staged with email, username and phone number and an OTP is sent for account creation.',
  })
  @ApiBody({
    type: RequestAuthOtpDto,
    examples: {
      requestOtpForNewUser: {
        summary: 'New user request',
        value: {
          email: 'jane@example.com',
          username: 'jane_doe',
          phoneNumber: '+233201234567',
        },
      },
      requestOtpForExistingUser: {
        summary: 'Existing user request',
        value: {
          username: 'jane_doe',
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
        message: 'OTP sent successfully.',
        data: {
          email: 'jane@example.com',
          isNewUser: false,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request payload',
    schema: {
      example: {
        message: 'Provide at least an email or username',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'User conflict',
    schema: {
      example: {
        message: 'Phone number already exists',
        error: 'Conflict',
        statusCode: 409,
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Users service timeout',
    schema: {
      example: {
        message: 'Request to users-service timed out for pattern auth.requestOtp',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  requestOtp(@Body() requestAuthOtpDto: RequestAuthOtpDto) {
    return this.authenticationService.requestOtp(requestAuthOtpDto);
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
        status: true,
        message: 'Authentication successful',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Malformed token payload',
    schema: {
      example: {
        message: 'token should not be empty',
        error: 'Bad Request',
        statusCode: 400,
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
    status: 409,
    description: 'Google account linkage conflict',
    schema: {
      example: {
        message: 'Google account already linked to another user',
        error: 'Conflict',
        statusCode: 409,
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
        status: true,
        message: 'Authentication successful',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Malformed token payload',
    schema: {
      example: {
        message: 'token should not be empty',
        error: 'Bad Request',
        statusCode: 400,
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
    status: 409,
    description: 'Apple account linkage conflict',
    schema: {
      example: {
        message: 'Apple account already linked to another user',
        error: 'Conflict',
        statusCode: 409,
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
        value: { identifier: 'jane@example.com', otp: '123456' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'OTP verified and auth tokens issued',
    schema: {
      example: {
        status: true,
        message: 'OTP verified successfully.',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
        data: {
          nextAction: 'CREATE_PROFILE',
          profileComplete: false,
          profileType: null,
          user: {
            id: '0b542e13-b426-456d-a615-1d2c1c3b8a31',
            email: 'jane@example.com',
            username: 'jane_doe',
            phoneNumber: '+233201234567',
            role: 'Client',
            googleId: null,
            appleId: null,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'OTP is invalid or expired',
    schema: {
      example: {
        message: 'Invalid OTP',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Users service timeout',
    schema: {
      example: {
        message: 'Request to users-service timed out for pattern auth.verifyOtp',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  verifySignUpOtp(@Body() verifySignUpOtpDto: VerifySignUpOtpDto) {
    return this.authenticationService.verifySignUpOtp(verifySignUpOtpDto);
  }

  @Post('verify-otp')
  @ApiOperation({
    summary: 'Verify OTP and authenticate user',
    description:
      'Validates the OTP, creates the user if needed, and returns access and refresh tokens. If the user has no profile yet, the response indicates that profile creation is the next action.',
  })
  @ApiBody({
    type: VerifyAuthOtpDto,
    examples: {
      verifyOtp: {
        summary: 'Verify OTP',
        value: { identifier: 'jane_doe', otp: '123456' },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'OTP verified and auth tokens issued',
    schema: {
      example: {
        status: true,
        message: 'OTP verified successfully.',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
        data: {
          nextAction: 'AUTHENTICATED',
          profileComplete: true,
          profileType: 'Musician',
          user: {
            id: '0b542e13-b426-456d-a615-1d2c1c3b8a31',
            email: 'jane@example.com',
            username: 'jane_doe',
            phoneNumber: '+233201234567',
            role: 'Musician',
            googleId: null,
            appleId: null,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'OTP is invalid or expired',
    schema: {
      example: {
        message: 'No OTP found for this identifier',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Users service timeout',
    schema: {
      example: {
        message: 'Request to users-service timed out for pattern auth.verifyOtp',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  verifyOtp(@Body() verifyAuthOtpDto: VerifyAuthOtpDto) {
    return this.authenticationService.verifyOtp(verifyAuthOtpDto);
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
        value: { identifier: 'jane@example.com' },
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
  @ApiResponse({
    status: 400,
    description: 'Resend request rejected',
    schema: {
      example: {
        message: 'Please wait 60 seconds before requesting another OTP.',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Users service timeout',
    schema: {
      example: {
        message: 'Request to users-service timed out for pattern auth.requestOtp',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  resendSignUpOtp(@Body() resendSignUpOtpDto: ResendSignUpOtpDto) {
    return this.authenticationService.resendSignUpOtp(resendSignUpOtpDto);
  }

  @Post('refresh-tokens')
  @ApiOperation({
    summary: 'Refresh access and refresh tokens',
    description:
      'Accepts a valid refresh token, rotates it, and returns a new access token and refresh token pair.',
  })
  @ApiBody({
    type: RefreshTokenDto,
    examples: {
      refreshTokens: {
        summary: 'Refresh token payload',
        value: {
          refreshToken:
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh-token-value',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Tokens refreshed successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new-access',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.new-refresh',
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Refresh token is invalid or expired',
    schema: {
      example: {
        statusCode: 401,
        message: 'Refresh token is invalid',
        error: 'Unauthorized',
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Users service timeout',
    schema: {
      example: {
        message:
          'Request to users-service timed out for pattern auth.refreshTokens',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
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
  @ApiResponse({
    status: 400,
    description: 'Invalid email payload',
    schema: {
      example: {
        message: ['email must be an email'],
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Users service timeout',
    schema: {
      example: {
        message:
          'Request to users-service timed out for pattern auth.forgotPassword',
        error: 'Gateway Timeout',
        statusCode: 504,
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
  @ApiResponse({
    status: 400,
    description: 'Reset code is invalid, expired, or payload is invalid',
    schema: {
      example: {
        message: 'Invalid or expired password reset code',
        error: 'Bad Request',
        statusCode: 400,
      },
    },
  })
  @ApiResponse({
    status: 504,
    description: 'Users service timeout',
    schema: {
      example: {
        message:
          'Request to users-service timed out for pattern auth.resetPassword',
        error: 'Gateway Timeout',
        statusCode: 504,
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
