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
      const loginTicket = await this.oauthClient.verifyIdToken({
        idToken: token,
      });
      
const payload = loginTicket.getPayload();
if (!payload || !payload.sub || !payload.email) {
  throw new UnauthorizedException('Invalid Google token');
}
const { email, sub: googleId } = payload;
      

      const user = await this.userRepository.findOneBy({ googleId });

      if (user) {
        return this.authenticationService.generateTokens(user);
      } else {
        const newUser = await this.userRepository.save({
          email,
          googleId,
        });

        return this.authenticationService.generateTokens(newUser);
      }
    } catch (error: any) { // ← cast error to any
    const pgUniqueViolationErrorCode = '23505';
    if (error?.code === pgUniqueViolationErrorCode) {
      throw new ConflictException('User already exists');
    }
    throw new UnauthorizedException();
    }
  }
}
