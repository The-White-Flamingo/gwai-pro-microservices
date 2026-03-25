import {
  ForgotPasswordDto,
  ResendSignUpOtpDto,
  ResetPasswordDto,
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  VerifySignUpOtpDto,
} from '@app/iam';
import { USERS_SERVICE } from '@app/shared';
import {
  BadRequestException,
  ConflictException,
  GatewayTimeoutException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout, TimeoutError } from 'rxjs';
// apps/api-gateway/src/users/auth/auth.service.ts
import { AdminSignInDto} from '@app/iam';


@Injectable()
export class AuthService {
  private static readonly RMQ_TIMEOUT_MS = 15000;

  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

  private async sendWithTimeout<T>(pattern: string, payload: unknown): Promise<T> {
    try {
      return await lastValueFrom(
        this.client
          .send<T>(pattern, payload)
          .pipe(timeout(AuthService.RMQ_TIMEOUT_MS)),
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          `Request to users-service timed out for pattern ${pattern}`,
        );
      }
      throw error;
    }
  }

  async signUp(signUpDto: SignUpDto) {
    try {
      const user = await this.sendWithTimeout('auth.signUp', signUpDto);
      return user;
    } catch (error) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      } else if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async signIn(signInDto: SignInDto) {
    try {
      const user = await this.sendWithTimeout('auth.signIn', signInDto);
      return user;
    } catch (error) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  // admin sign-in
  async adminSignIn(adminSignInDto: AdminSignInDto) {
  try {
    return await this.sendWithTimeout('auth.adminSignIn', adminSignInDto);
  } catch (error) {
    if (error instanceof GatewayTimeoutException) {
      throw error;
    }
    if (error instanceof UnauthorizedException) {
      throw new UnauthorizedException(error.message);
    }
    throw new BadRequestException(error.message);
  }
}

  async verifySignUpOtp(verifySignUpOtpDto: VerifySignUpOtpDto) {
    try {
      return await this.sendWithTimeout(
        'auth.verifySignUpOtp',
        verifySignUpOtpDto,
      );
    } catch (error) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      } else if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async resendSignUpOtp(resendSignUpOtpDto: ResendSignUpOtpDto) {
    try {
      return await this.sendWithTimeout(
        'auth.resendSignUpOtp',
        resendSignUpOtpDto,
      );
    } catch (error) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }
      if (error instanceof ConflictException) {
        throw new ConflictException(error.message);
      } else if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const tokens = await this.sendWithTimeout(
        'auth.refreshTokens',
        refreshTokenDto,
      );
      return tokens;
    } catch (error) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      return await this.sendWithTimeout(
        'auth.forgotPassword',
        forgotPasswordDto,
      );
    } catch (error) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      return await this.sendWithTimeout(
        'auth.resetPassword',
        resetPasswordDto,
      );
    } catch (error) {
      if (error instanceof GatewayTimeoutException) {
        throw error;
      }
      throw new BadRequestException(error.message);
    }
  }
}
