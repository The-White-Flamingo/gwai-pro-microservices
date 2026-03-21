import { RefreshTokenDto, SignInDto, SignUpDto } from '@app/iam';
import { USERS_SERVICE } from '@app/shared';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
// import reset and forgot password dtos
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
// import { ActiveUser, ActiveUserData } from '@app/iam';

@Injectable()
export class AuthService {
  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

  async signUp(signUpDto: SignUpDto) {
    try {
      const user = await lastValueFrom(
        this.client.send('auth.signUp', signUpDto),
      );
      return user;
    } catch (error) {
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
      const user = await lastValueFrom(
        this.client.send('auth.signIn', signInDto),
      );
      return user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }

  // verify email and resend verification email methods
  // apps/api-gateway/src/users/auth/auth.service.ts
  async verifyEmail(token: string) {
    try {
      return await lastValueFrom(this.client.send('auth.verifyEmail', { token }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async resendVerificationEmail(email: string) {
    try {
      return await lastValueFrom(this.client.send('auth.resendVerificationEmail', { email }));
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // auth.service.ts (api-gateway)
  // add a method to get the profile completion status of a user
  async getProfileStatus(userId: string) {
    try {
      return await lastValueFrom(
        this.client.send('auth.profileStatus', { userId }),
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  //  add forgot password and reset password methods
  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      return await lastValueFrom(
        this.client.send('auth.forgotPassword', forgotPasswordDto),
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      return await lastValueFrom(
        this.client.send('auth.resetPassword', resetPasswordDto),
      );
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const tokens = await lastValueFrom(
        this.client.send('auth.refreshTokens', refreshTokenDto),
      );
      return tokens;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(error.message);
      }
      throw new BadRequestException(error.message);
    }
  }
}
