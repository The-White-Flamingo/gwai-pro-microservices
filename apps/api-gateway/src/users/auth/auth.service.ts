import { RefreshTokenDto, SignInDto, SignUpDto } from '@app/iam';
import { USERS_SERVICE } from '@app/shared';
import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

  async signUp(signUpDto: SignUpDto) {
    const user = await lastValueFrom(
      this.client.send('auth.signUp', signUpDto),
    );
    return user;
  }

  async signIn(signInDto: SignInDto) {
    const user = await lastValueFrom(
      this.client.send('auth.signIn', signInDto),
    );
    return user;
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    const user = await lastValueFrom(
      this.client.send('auth.refreshTokens', refreshTokenDto),
    );
    return user;
  }
}
