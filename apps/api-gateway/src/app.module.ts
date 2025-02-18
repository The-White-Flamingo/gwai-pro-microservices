import { Module } from '@nestjs/common';
import { ApiGatewayController } from './app.controller';
import { ApiGatewayService } from './app.service';
import { UsersModule } from './users/users.module';
import { PaymentsModule } from './payments/payments.module';
import { BookingsModule } from './bookings/bookings.module';
import { APP_GUARD } from '@nestjs/core';
import { AccessTokenGuard, AuthenticationGuard, RolesGuard } from '@app/iam';
import { JwtModule } from '@nestjs/jwt';
import jwtConfig from '@app/iam/config/jwt.config';
import { ConfigModule } from '@nestjs/config';
import { PostsModule } from './posts/posts.module';
import { WaitlistModule } from './waitlist/waitlist.module';

@Module({
  imports: [
    JwtModule.registerAsync(jwtConfig.asProvider()),
    ConfigModule.forFeature(jwtConfig),
    UsersModule,
    PaymentsModule,
    BookingsModule,
    PostsModule,
    WaitlistModule,
  ],
  controllers: [ApiGatewayController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthenticationGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
    AccessTokenGuard,
    ApiGatewayService,
  ],
})
export class ApiGatewayModule {}
