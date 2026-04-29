import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { AuthenticationService } from '../authentication.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity';

@Injectable()
export class GoogleAuthenticationService implements OnModuleInit {
  private oauthClient: OAuth2Client;

  constructor(
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  onModuleInit() {
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    this.oauthClient = new OAuth2Client(clientId, clientSecret);
  }

  async authenticate(token: string) {
    if (!this.oauthClient) {
  const clientId = this.configService.get('GOOGLE_CLIENT_ID');
  const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
  this.oauthClient = new OAuth2Client(clientId, clientSecret);
}
    try {
      const audiences = this.getAudiences();
      if (audiences.length === 0) {
        throw new UnauthorizedException('Google auth is not configured');
      }

      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: token,
        audience: audiences,
      });

      const payload = loginTicket.getPayload();
      if (!payload?.email || !payload.sub || payload.email_verified !== true) {
        throw new UnauthorizedException('Invalid Google token');
      }

      const user = await this.findOrCreateUser(payload.email, payload.sub);
      return this.authenticationService.generateTokens(user);
    } catch (error) {
      const pgUniqueViolationErrorCode = '23505';
      if (error.code === pgUniqueViolationErrorCode) {
        throw new ConflictException('User already exists');
      }
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new UnauthorizedException(error?.message ?? 'Google authentication failed');
    }
  }

  private getAudiences(): string[] {
    const clientIds = this.configService.get<string>('GOOGLE_CLIENT_ID') ?? '';
    return clientIds
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private async findOrCreateUser(email: string, googleId: string) {
    const existingByGoogleId = await this.userRepository.findOneBy({ googleId });
    if (existingByGoogleId) {
      return existingByGoogleId;
    }

    const existingByEmail = await this.userRepository.findOneBy({ email });
    if (existingByEmail) {
      if (existingByEmail.googleId && existingByEmail.googleId !== googleId) {
        throw new ConflictException('Google account already linked to another user');
      }
      existingByEmail.googleId = googleId;
      return this.userRepository.save(existingByEmail);
    }

    return this.userRepository.save(
      this.userRepository.create({
        email,
        googleId,
      }),
    );
  }
}
