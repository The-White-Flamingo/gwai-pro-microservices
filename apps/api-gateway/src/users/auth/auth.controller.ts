import {
  AdminSignInDto,
  AdminSignUpDto,
  AppleTokenDto,
  FirebaseTokenDto,
  Auth,
  AuthType,
  ForgotPasswordDto,
  GoogleTokenDto,
  RequestAuthOtpDto,
  RequestSmsOtpDto,
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
  Post,
  Res,
  Get,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
// import reset and forgot password dtos
// import { ForgotPasswordDto } from './dto/forgot-password.dto';
// import { ResetPasswordDto } from './dto/reset-password.dto';
import { AdminSignInDto} from '@app/iam';


@ApiTags('auth')
@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
  constructor(private readonly authenticationService: AuthService) {}

  // @Post('sign-up')
  // @ApiOperation({
  //   summary: 'Request sign-up OTP',
  //   description:
  //     'Creates or updates a pending signup and sends a 6-digit OTP to the provided email.',
  // })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     required: ['email'],
  //     properties: {
  //       email: { type: 'string', format: 'email', example: 'jane@example.com' },
  //     },
  //   },
  //   examples: {
  //     clientSignUp: {
  //       summary: 'New user OTP request',
  //       value: {
  //         email: 'jane@example.com',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'OTP sent successfully',
  //   schema: {
  //     example: {
  //       status: true,
  //       message: 'OTP sent successfully.',
  //       data: {
  //         email: 'jane@example.com',
  //         isNewUser: true,
  //         hasProfile: false,
  //         profileType: null,
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Invalid request payload',
  //   schema: {
  //     example: {
  //       message: 'Email is required for new users',
  //       error: 'Bad Request',
  //       statusCode: 400,
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 409,
  //   description: 'User conflict',
  //   schema: {
  //     example: {
  //       message: 'Username already exists',
  //       error: 'Conflict',
  //       statusCode: 409,
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 504,
  //   description: 'Users service timeout',
  //   schema: {
  //     example: {
  //       message: 'Request to users-service timed out for pattern auth.requestOtp',
  //       error: 'Gateway Timeout',
  //       statusCode: 504,
  //     },
  //   },
  // })
  // signUp(@Body() signUpDto: SignUpDto) {
  //   return this.authenticationService.signUp(signUpDto);
  // }

  // @Post('sign-in')
  // @ApiOperation({
  //   summary: 'Request OTP for existing user',
  //   description:
  //     'Requests an authentication OTP for an existing user using email or username.',
  // })
  // @ApiBody({
  //   type: SignInDto,
  //   examples: {
  //     signInWithEmail: {
  //       summary: 'Sign in with email',
  //       value: { identifier: 'jane@example.com' },
  //     },
  //     signInWithUsername: {
  //       summary: 'Sign in with username',
  //       value: { identifier: 'jane_doe' },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'OTP sent successfully',
  //   schema: {
  //     example: {
  //       status: true,
  //       message: 'OTP sent successfully.',
  //       data: {
  //         email: 'jane@example.com',
  //         isNewUser: false,
  //         hasProfile: true,
  //         profileType: 'Client',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 400,
  //   description: 'Identifier is invalid or user not found',
  //   schema: {
  //     example: {
  //       message: 'Provide at least an email or username',
  //       error: 'Bad Request',
  //       statusCode: 400,
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 504,
  //   description: 'Users service timeout',
  //   schema: {
  //     example: {
  //       message: 'Request to users-service timed out for pattern auth.requestOtp',
  //       error: 'Gateway Timeout',
  //       statusCode: 504,
  //     },
  //   },
  // })
  // signIn(@Body() signInDto: SignInDto) {
  //   return this.authenticationService.signIn(signInDto);
  // }

  // @Post('admin/sign-up')
  // @ApiOperation({
  //   summary: 'Create an admin account with email and password',
  //   description:
  //     'Creates an admin directly in the users table and returns bearer tokens. Admin accounts do not need an admin profile before accessing protected admin routes.',
  // })
  // @ApiBody({
  //   type: AdminSignUpDto,
  //   examples: {
  //     seededAdmin: {
  //       summary: 'Seeded admin credentials',
  //       value: {
  //         email: 'admin@gwaipro.com',
  //         password: 'admingwai@123!',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Admin account created successfully',
  //   schema: {
  //     example: {
  //       status: true,
  //       message: 'Admin signed up successfully.',
  //       accessToken: '<jwt-access-token>',
  //       refreshToken: '<jwt-refresh-token>',
  //       data: {
  //         nextAction: 'AUTHENTICATED',
  //         profileComplete: true,
  //         profileType: 'Admin',
  //         user: {
  //           id: '8746dd82-89f7-46e8-89dd-f81d7a68d4f9',
  //           email: 'admin@gwaipro.com',
  //           username: null,
  //           phoneNumber: null,
  //           role: 'Admin',
  //           googleId: null,
  //           appleId: null,
  //           firebaseUid: null,
  //         },
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 409,
  //   description: 'Admin already exists',
  //   schema: {
  //     example: {
  //       message: 'Admin already exists',
  //       error: 'Conflict',
  //       statusCode: 409,
  //     },
  //   },
  // })
  // adminSignUp(@Body() adminSignUpDto: AdminSignUpDto) {
  //   return this.authenticationService.adminSignUp(adminSignUpDto);
  // }

  @Post('admin/sign-in')
  @ApiOperation({
    summary: 'Authenticate an admin with email and password',
    description:
      'Signs in an admin with direct credentials and returns bearer tokens for admin-only endpoints',
  })
  @ApiBody({
    type: AdminSignInDto,
    examples: {
      adminCredentials: {
        summary: 'Admin sign-in payload',
        value: {
          email: 'admin@gwaipro.com',
          password: 'admingwai@123!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Admin signed in successfully',
    schema: {
      example: {
        status: true,
        message: 'Admin signed in successfully.',
        accessToken: '<jwt-access-token>',
        refreshToken: '<jwt-refresh-token>',
        data: {
          nextAction: 'AUTHENTICATED',
          profileComplete: true,
          profileType: 'Admin',
          user: {
            id: '8746dd82-89f7-46e8-89dd-f81d7a68d4f9',
            email: 'admin@gwaipro.com',
            // username: null,
            // phoneNumber: null,
            // role: 'Admin',
            // googleId: null,
            // appleId: null,
            // firebaseUid: null,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid admin credentials',
    schema: {
      example: {
        message: 'Invalid admin credentials',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  adminSignIn(@Body() adminSignInDto: AdminSignInDto) {
    return this.authenticationService.adminSignIn(adminSignInDto);
  }

  @Post('request-otp')
  @ApiOperation({
    summary: 'Request OTP for signup or signin',
    description:
      'Unified auth entrypoint. Existing users can use email or username. New users must provide email so the OTP can be sent there.',
  })
  @ApiBody({
    type: RequestAuthOtpDto,
    examples: {
      requestOtpForNewUser: {
        summary: 'New user request',
        value: {
          email: 'jane@example.com',
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
          hasProfile: true,
          profileType: 'Client',
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

  @Post('request-sms-otp')
  @ApiOperation({
    summary: 'Request sign-in OTP by SMS',
    description:
      'Sends an OTP by SMS to an existing user whose profile is complete and whose phone number already exists on the account.',
  })
  @ApiBody({
    type: RequestSmsOtpDto,
  })
  @ApiResponse({
    status: 201,
    description: 'OTP sent successfully',
    schema: {
      example: {
        status: true,
        message: 'OTP sent successfully.',
        data: {
          email: 'gwai@domain.com',
          phoneNumber: '+233201234567',
          deliveryChannel: 'sms',
          deliveryTarget: '+233201234567',
          isNewUser: false,
          hasProfile: true,
          profileType: 'Client',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'SMS OTP request rejected',
    schema: {
      example: {
        message: 'SMS OTP is only available for users with completed profiles',
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
          'Request to users-service timed out for pattern auth.requestSmsOtp',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  requestSmsOtp(@Body() requestSmsOtpDto: RequestSmsOtpDto) {
    return this.authenticationService.requestSmsOtp(requestSmsOtpDto);
  }

  /*
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
  */

  @Post('firebase')
  @ApiOperation({
    summary: 'Authenticate with Firebase ID token',
    description:
      'Accepts a Firebase Authentication ID token from the frontend, verifies it with Firebase Admin in users-service, stores or links the user in the users table, and returns access and refresh tokens. Use this when the frontend signs in through Firebase Auth with Google or Apple.',
  })
  @ApiBody({
    type: FirebaseTokenDto,
    examples: {
      firebaseGoogleAuth: {
        summary: 'Firebase ID token from Google sign-in',
        value: {
          token:
            'eyJhbGciOiJSUzI1NiIsImtpZCI6ImZpcmViYXNlLWtpZCIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ5b3VyLWZpcmViYXNlLXByb2plY3QiLCJlbWFpbCI6ImphbmVAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwidXNlcl9pZCI6ImZpcmViYXNlLXVpZC0xMjMiLCJmaXJlYmFzZSI6eyJzaWduX2luX3Byb3ZpZGVyIjoiZ29vZ2xlLmNvbSJ9fQ.signature',
        },
      },
      firebaseAppleAuth: {
        summary: 'Firebase ID token from Apple sign-in',
        value: {
          token:
            'eyJhbGciOiJSUzI1NiIsImtpZCI6ImZpcmViYXNlLWtpZCIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJ5b3VyLWZpcmViYXNlLXByb2plY3QiLCJlbWFpbCI6ImphbmVAZXhhbXBsZS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwidXNlcl9pZCI6ImZpcmViYXNlLXVpZC1hcHBsZS0xMjMiLCJmaXJlYmFzZSI6eyJzaWduX2luX3Byb3ZpZGVyIjoiYXBwbGUuY29tIn19.signature',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Firebase authentication successful',
    schema: {
      example: {
        status: true,
        message: 'Firebase authentication successful',
        accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.access',
        refreshToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.refresh',
        data: {
          nextAction: 'CREATE_PROFILE',
          profileComplete: false,
          profileType: null,
          user: {
            id: '0b542e13-b426-456d-a615-1d2c1c3b8a31',
            email: 'jane@example.com',
            username: null,
            phoneNumber: null,
            role: 'Pending',
            googleId: null,
            appleId: null,
            firebaseUid: 'firebase-uid-123',
          },
        },
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
    description: 'Invalid Firebase token or backend config',
    schema: {
      example: {
        message: 'Firebase auth is not configured',
        error: 'Unauthorized',
        statusCode: 401,
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Firebase account linkage conflict',
    schema: {
      example: {
        message: 'Firebase account already linked to another user',
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
        message: 'Request to users-service timed out for pattern auth.firebase',
        error: 'Gateway Timeout',
        statusCode: 504,
      },
    },
  })
  authenticateWithFirebase(@Body() firebaseTokenDto: FirebaseTokenDto) {
    return this.authenticationService.authenticateWithFirebase(firebaseTokenDto);
  }

  /* @Post('verify-sign-up-otp')
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
            role: 'Pending',
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
  } */

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
        value: { identifier: 'bobbai', otp: '123456' },
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

  // apps/api-gateway/src/users/auth/auth.controller.ts
// import { AdminSignInDto, ... } from '@app/iam';
// admin sign-in
  @Post('admin/sign-in')
  @ApiOperation({
    summary: 'Admin sign in',
    description: 'Authenticates an admin user with email and password only. No OTP or email verification required.',
  })
  @ApiBody({
    type: AdminSignInDto,
    examples: {
      adminSignIn: {
        summary: 'Admin login',
        value: {
          email: 'admin@gwaipro.com',
          password: 'Admin@1234!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Admin authenticated successfully',
    schema: {
      example: {
        accessToken: 'eyJhbGc...',
        refreshToken: 'eyJhbGc...',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid credentials',
  })
  @ApiResponse({
    status: 401,
    description: 'Not an admin account',
  })
  adminSignIn(@Body() adminSignInDto: AdminSignInDto) {
    return this.authenticationService.adminSignIn(adminSignInDto);
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
        value: { identifier: '+233201234567' },
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
  } */

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

  /* @Post('forgot-password')
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
  } */

  /* @Post('reset-password')
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
  } */

  // @ApiBearerAuth()
  // @Auth(AuthType.Bearer)
  // @HttpCode(HttpStatus.OK)
  // @Post('2fa/generate')
  // async generateQrCode(
  //   @ActiveUser() activeUser: ActiveUserData,
  //   @Res() response: Response,
  // ) {}
}
