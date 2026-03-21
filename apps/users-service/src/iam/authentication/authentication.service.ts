import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { randomUUID } from 'crypto';
import { InvalidateRefreshTokenError } from './errors/invalidate-refresh-token.error';
import { User } from '../../users/entities/user.entity';
import { Role } from '../../users/enums/role.enum';
import { Client } from '../../users/clients/entities/client.entity';
import { Musician } from '../../users/musicians/entities/musician.entity';
import { Studio } from '../../users/studios/entities/studio.entity';
// update authentication to verify email addresses by sending a verification email with a unique token that expires after a certain period of time
import { ClientProxy } from '@nestjs/microservices';
import { MAILING_SERVICE } from '@app/shared';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(Musician)
    private readonly musicianRepository: Repository<Musician>,
    @InjectRepository(Studio)
    private readonly studioRepository: Repository<Studio>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
    // inject the mailing service client proxy
    @Inject(MAILING_SERVICE) private readonly mailingClient: ClientProxy,
  ) {}

  // private helper method to check completeness of user profile per role
  // apps/users-service/src/iam/authentication/authentication.service.ts

private async checkProfileComplete(user: User): Promise<boolean> {
  switch (user.role) {
    case Role.Client: {
      const client = await this.clientRepository.findOne({
        where: { user: { id: user.id } },
      });
      if (!client) return false;
      return !!(
        client.firstName &&
        client.lastName &&
        client.contact &&
        client.dateOfBirth &&
        client.genres?.length > 0 &&
        client.interests?.length > 0
      );
    }

    case Role.Musician: {
      const musician = await this.musicianRepository.findOne({
        where: { user: { id: user.id } },
      });
      if (!musician) return false;
      return !!(
        musician.firstName &&
        musician.lastName &&
        musician.contact &&
        musician.dateOfBirth &&
        musician.genres?.length > 0 &&
        musician.interests?.length > 0
      );
    }

    case Role.Studio: {
      const studio = await this.studioRepository.findOne({
        where: { user: { id: user.id } },
      });
      if (!studio) return false;
      return !!(
        studio.name &&
        studio.contact &&
        studio.location &&
        studio.services?.length > 0
      );
    }

    default:
      return true; // Admin or unknown roles are always considered complete
    }
  }

  // authentication.service.ts
  async getProfileStatus(userId: string) {
    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) return new BadRequestException('User not found').getResponse();

    const isProfileComplete = await this.checkProfileComplete(user);

    return {
      status: true,
      emailVerified: user.isEmailVerified,
      isProfileComplete,
      role: user.role,
    };
  }

  // update the sign-up method to generate a unique email verification token, save it to the user's record along with an expiration date, and send a verification email with the token included in the verification link
  async signUp(signUpDto: SignUpDto) {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      // generate verification token and expiration date
      const verificationToken = randomUUID();
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // expires in 24 hours

      const user = this.userRepository.create({
        ...signUpDto,
        password: await this.hashingService.hash(signUpDto.password),
        isEmailVerified: false,
        emailVerificationToken: verificationToken,
        emailVerificationTokenExpiresAt: expiresAt,
      });

      await queryRunner.manager.save(user);

      if (signUpDto.role === Role.Client) {
        const client = this.clientRepository.create({
          user,
        });

        await queryRunner.manager.save(client);
      } else if (signUpDto.role === Role.Musician) {
        const musician = this.musicianRepository.create({
          user,
        });

        await queryRunner.manager.save(musician);
      } else if (signUpDto.role === Role.Studio) {
        const studio = this.studioRepository.create({
          user,
        });

        await queryRunner.manager.save(studio);
      } else {
        return new UnauthorizedException().getResponse();
      }

      await queryRunner.commitTransaction();

      // fire-and-forget the email verification message to the mailing service
      this.mailingClient.emit('mailer.send',{
        to:user.email,
        subject: 'Verify your email address',
        text: `Your verification link : ${process.env.APP_URL}/verify-email?token=${verificationToken}`,
        html: `<p>Your verification link : <a href="${process.env.APP_URL}/verify-email?token=${verificationToken}">Verify Email</a></p>`,
      });
      

      return {
        status: true,
        message: `${user.role} signed up successfully. Please check your email to verify your account.`,
      }; 
    } catch (error) {
      await queryRunner.rollbackTransaction();
      const pgUniqueViolationErrorCode = '23505';
      if (error.code === pgUniqueViolationErrorCode) {
        return new ConflictException('User already exists').getResponse();
      }
      return new BadRequestException(error.message).getResponse();
    } finally {
      await queryRunner.release();
    }
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.userRepository.findOneBy({
      email: signInDto.email,
    });

    if (!user) {
      return new BadRequestException('User does not exist').getResponse();
    }

    const isPasswordValid = await this.hashingService.compare(
      signInDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      return new BadRequestException('Password does not match').getResponse();
    }

    // Email verification check
    if (!user.isEmailVerified) {
      return {
        status: false,
        emailVerified: false,
        message: 'Please verify your email before signing in.',
      };
    }

    // is profile complete check
    const isProfileComplete = await this.checkProfileComplete(user);

    if (!isProfileComplete) {
      return {
        status: false,
        emailVerified: true,
        isProfileComplete: false,
        message: 'Please complete your profile.',
      };
    }

    // all checks passed - issue tokens
    return {
      ...(await this.generateTokens(user)),
      emailVerified: true,
      isProfileComplete: true,
      message: 'Sign-in successful',
    };
  }

  // verify email method that takes the verification token as a parameter, checks if it's valid and not expired, and if so, marks the user's email as verified
  async verifyEmail(token: string) {
    const user = await this.userRepository.findOneBy({
      emailVerificationToken: token,
    });

    if (!user) {
      return new BadRequestException('Invalid verification token').getResponse();
    }

    if (user.emailVerificationTokenExpiresAt < new Date()) {
      return new BadRequestException('Verification token has expired').getResponse();
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = null;
    user.emailVerificationTokenExpiresAt = null;
    await this.userRepository.save(user);

    return { status: true, message: 'Email verified successfully.' };
  }

  // resend email verification method that takes the user's email as a parameter, generates a new verification token, updates the user's record with the new token and expiration date, and sends a new verification email
  async resendVerificationEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) return new BadRequestException('User not found').getResponse();
    if (user.isEmailVerified) return new BadRequestException('Email already verified').getResponse();

    const verificationToken = randomUUID();
    user.emailVerificationToken = verificationToken;
    user.emailVerificationTokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await this.userRepository.save(user);

    this.mailingClient.emit('mailer.send', {
      to: user.email,
      subject: 'Verify your Gwaipro email',
      text: `Your new verification link: ${process.env.APP_URL}/auth/verify-email?token=${verificationToken}`,
      html: `<p>Click <a href="${process.env.APP_URL}/auth/verify-email?token=${verificationToken}">here</a> to verify your email.</p>`,
    });

    return { status: true, message: 'Verification email resent.' };
  }

  // forgot password method that takes the user's email as a parameter, generates a password reset token, saves it to the user's record along with an expiration date, and sends a password reset email with the token included in the reset link
  // apps/users-service/src/iam/authentication/authentication.service.ts

async forgotPassword(email: string) {
  const user = await this.userRepository.findOneBy({ email });

  // Always return the same response whether the email exists or not.
  // This prevents user enumeration attacks.
  const genericResponse = {
    status: true,
    message: 'If that email is registered, a reset link has been sent.',
  };

  if (!user) return genericResponse;

  const resetToken = randomUUID();
  user.passwordResetToken = resetToken;
  user.passwordResetTokenExpiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
  await this.userRepository.save(user);

  this.mailingClient.emit('mailer.send', {
    to: user.email,
    subject: 'Reset your Gwaipro password',
    text: `Reset your password: ${process.env.APP_URL}/auth/reset-password?token=${resetToken}`,
    html: `
      <p>You requested a password reset.</p>
      <p>Click <a href="${process.env.APP_URL}/auth/reset-password?token=${resetToken}">here</a> to reset your password.</p>
      <p>This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    `,
  });

  return genericResponse;
}

// reset password method that takes the reset token and new password as parameters, checks if the token is valid and not expired, and if so, updates
async resetPassword(token: string, newPassword: string) {
  const user = await this.userRepository.findOneBy({
    passwordResetToken: token,
  });

  if (!user) {
    return new BadRequestException('Invalid or expired reset token').getResponse();
  }

  if (user.passwordResetTokenExpiresAt < new Date()) {
    return new BadRequestException('Reset token has expired').getResponse();
  }

  user.password = await this.hashingService.hash(newPassword);
  user.passwordResetToken = null;
  user.passwordResetTokenExpiresAt = null;

  // Invalidate all existing refresh tokens so other sessions are logged out
  await this.refreshTokenIdsStorage.invalidate(user.id);

  await this.userRepository.save(user);

  return { status: true, message: 'Password reset successfully.' };
}

  async generateTokens(user: User) {
    const refreshTokenId = randomUUID();
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
          role: user.role,
        },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl, {
        refreshTokenId,
      }),
    ]);

    await this.refreshTokenIdsStorage.insert(user.id, refreshTokenId);

    return {
      accessToken,
      refreshToken,
    };
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const { sub, refreshTokenId } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'> & { refreshTokenId: string }
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.userRepository.findOneByOrFail({
        id: sub,
      });

      const isValid = await this.refreshTokenIdsStorage.validate(
        user.id,
        refreshTokenId,
      );

      if (isValid) {
        await this.refreshTokenIdsStorage.invalidate(user.id);
      } else {
        return new UnauthorizedException(
          'Refresh token is invalid',
        ).getResponse();
      }

      return await this.generateTokens(user);
    } catch (error) {
      if (error instanceof InvalidateRefreshTokenError) {
        return new UnauthorizedException('Access denied').getResponse();
      }
      return new UnauthorizedException(error.message).getResponse();
    }
  }

  private async signToken<T>(userId: string, expiresIn: number, payload?: T) {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }
}
