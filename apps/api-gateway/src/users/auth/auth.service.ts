import { RefreshTokenDto, SignInDto, SignUpDto } from '@app/iam';
import { USERS_SERVICE } from '@app/shared';
import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) { }

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

