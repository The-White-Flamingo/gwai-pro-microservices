import { Module } from '@nestjs/common';
import { HashingService } from './hashing/hashing.service';
import { BcryptService } from './hashing/bcrypt.service';
import { AuthenticationController } from './authentication/authentication.controller';
import { AdminSeedService } from './authentication/admin-seed.service';
import { AuthenticationService } from './authentication/authentication.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from './config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AccessTokenGuard } from './authentication/guards/access-token.guard';
import { AuthenticationGuard } from './authentication/guards/authentication.guard';
import { RefreshTokenIdsStorage } from './authentication/refresh-token-ids.storage';
import { RolesGuard } from './authorization/guards/roles.guard';
import { ApiKeysService } from './authentication/api-keys.service';
import { ApiKeyGuard } from './authentication/guards/api-key.guard';
import { GoogleAuthenticationService } from './authentication/social/google-authentication.service';
import { GoogleAuthenticationController } from './authentication/social/google-authentication.controller';
import { AppleAuthenticationService } from './authentication/social/apple-authentication.service';
import { AppleAuthenticationController } from './authentication/social/apple-authentication.controller';
import { FirebaseAuthenticationService } from './authentication/social/firebase-authentication.service';
import { FirebaseAuthenticationController } from './authentication/social/firebase-authentication.controller';
import { User } from '../users/entities/user.entity';
import { ApiKey } from '../users/api-keys/entities/api-key.entity';
import { Client } from '../users/clients/entities/client.entity';
import { Musician } from '../users/musicians/entities/musician.entity';
import { Studio } from '../users/studios/entities/studio.entity';
import { Admin } from '../users/admins/entities/admin.entity';
import { SignUpOtp } from './authentication/entities/sign-up-otp.entity';
import { PasswordReset } from './authentication/entities/password-reset.entity';
import { MAILING_SERVICE } from '@app/shared';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      User,
      Client,
      Musician,
      Studio,
      Admin,
      ApiKey,
      SignUpOtp,
      PasswordReset,
    ]),
    ClientsModule.register([
      {
        name: MAILING_SERVICE,
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL],
          queue: 'mailing-service',
          queueOptions: {
            durable: true,
          },
        },
      },
    ]),
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
  ],
  providers: [
    {
      provide: HashingService,
      useClass: BcryptService,
    },
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AccessTokenGuard,
    ApiKeyGuard,
    RefreshTokenIdsStorage,
    AdminSeedService,
    AuthenticationService,
    ApiKeysService,
    GoogleAuthenticationService,
    AppleAuthenticationService,
    FirebaseAuthenticationService,
  ],
  controllers: [
    AuthenticationController,
    GoogleAuthenticationController,
    AppleAuthenticationController,
    FirebaseAuthenticationController,
  ],
})
export class IamModule {}
