import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ClientProxy } from '@nestjs/microservices';
import { Repository } from 'typeorm';
import { lastValueFrom, timeout } from 'rxjs';
import { CreateMailerDto, MAILING_SERVICE } from '@app/shared';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { VerifySignUpOtpDto } from './dto/verify-sign-up-otp.dto';
import { ResendSignUpOtpDto } from './dto/resend-sign-up-otp.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
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
import { Admin } from '../../users/admins/entities/admin.entity';
import { SignUpOtp } from './entities/sign-up-otp.entity';
import { PasswordReset } from './entities/password-reset.entity';

const SIGN_UP_OTP_TTL_MINUTES = 10;
const OTP_RESEND_COOLDOWN_SECONDS = 60;
const OTP_REQUEST_WINDOW_MINUTES = 15;
const OTP_MAX_REQUESTS_PER_WINDOW = 5;
const OTP_MAX_VERIFY_ATTEMPTS = 5;
const OTP_BLOCK_DURATION_MINUTES = 15;
const PASSWORD_RESET_OTP_TTL_MINUTES = 15;
const PASSWORD_RESET_MAX_REQUESTS_PER_WINDOW = 5;
const PASSWORD_RESET_MAX_VERIFY_ATTEMPTS = 5;
const PASSWORD_RESET_WINDOW_MINUTES = 15;
const PASSWORD_RESET_RESEND_COOLDOWN_SECONDS = 60;
const PASSWORD_RESET_BLOCK_DURATION_MINUTES = 15;
const MAILER_RPC_TIMEOUT_MS = 10000;

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
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(SignUpOtp)
    private readonly signUpOtpRepository: Repository<SignUpOtp>,
    @InjectRepository(PasswordReset)
    private readonly passwordResetRepository: Repository<PasswordReset>,
    @Inject(MAILING_SERVICE) private readonly mailingClient: ClientProxy,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
  ) {}

  async signUp(signUpDto: SignUpDto) {
    return this.requestSignUpOtp(signUpDto);
  }

  async requestSignUpOtp(signUpDto: SignUpDto) {
    try {
      const existingUser = await this.userRepository.findOneBy({
        email: signUpDto.email,
      });

      if (existingUser) {
        return new ConflictException('User already exists').getResponse();
      }

      if (!this.isValidRole(signUpDto.role)) {
        return new BadRequestException('Invalid role').getResponse();
      }

      const passwordHash = await this.hashingService.hash(signUpDto.password);

      const signUpOtp = await this.signUpOtpRepository.findOneBy({
        email: signUpDto.email,
      });

      const requestGuardError = this.getOtpRequestGuardError(signUpOtp);
      if (requestGuardError) {
        if (signUpOtp?.blockedUntil) {
          await this.signUpOtpRepository.save(signUpOtp);
        }
        return requestGuardError;
      }

      if (signUpOtp) {
        signUpOtp.passwordHash = passwordHash;
        signUpOtp.role = signUpDto.role;
        const sendOtpError = await this.saveAndSendOtp(signUpOtp, signUpDto.email);
        if (sendOtpError) {
          return sendOtpError;
        }
      } else {
        const pendingSignUp = this.signUpOtpRepository.create({
          email: signUpDto.email,
          otpHash: '',
          passwordHash,
          role: signUpDto.role,
          expiresAt: this.getOtpExpiryDate(),
          requestWindowStartedAt: new Date(),
          otpRequestCount: 0,
          verifyAttempts: 0,
        });
        const sendOtpError = await this.saveAndSendOtp(pendingSignUp, signUpDto.email);
        if (sendOtpError) {
          return sendOtpError;
        }
      }

      return {
        status: true,
        message: 'OTP sent to email. Verify OTP to complete sign up.',
      };
    } catch (error) {
      return new BadRequestException(error.message).getResponse();
    }
  }

  async resendSignUpOtp(resendSignUpOtpDto: ResendSignUpOtpDto) {
    try {
      const signUpOtp = await this.signUpOtpRepository.findOneBy({
        email: resendSignUpOtpDto.email,
      });

      if (!signUpOtp) {
        return new BadRequestException(
          'No sign-up request found for this email',
        ).getResponse();
      }

      if (new Date() > new Date(signUpOtp.expiresAt)) {
        await this.signUpOtpRepository.delete({ id: signUpOtp.id });
        return new BadRequestException(
          'OTP expired. Please sign up again to request a new OTP.',
        ).getResponse();
      }

      const requestGuardError = this.getOtpRequestGuardError(signUpOtp);
      if (requestGuardError) {
        if (signUpOtp.blockedUntil) {
          await this.signUpOtpRepository.save(signUpOtp);
        }
        return requestGuardError;
      }

      const sendOtpError = await this.saveAndSendOtp(
        signUpOtp,
        resendSignUpOtpDto.email,
      );
      if (sendOtpError) {
        return sendOtpError;
      }

      return {
        status: true,
        message: 'OTP resent successfully.',
      };
    } catch (error) {
      return new BadRequestException(error.message).getResponse();
    }
  }

  async verifySignUpOtp(verifySignUpOtpDto: VerifySignUpOtpDto) {
    try {
      const signUpOtp = await this.signUpOtpRepository.findOneBy({
        email: verifySignUpOtpDto.email,
      });

      if (!signUpOtp) {
        return new BadRequestException(
          'No sign-up OTP found for this email',
        ).getResponse();
      }

      if (new Date() > new Date(signUpOtp.expiresAt)) {
        await this.signUpOtpRepository.delete({ id: signUpOtp.id });
        return new BadRequestException('OTP has expired').getResponse();
      }

      const blockedError = this.getBlockedError(signUpOtp);
      if (blockedError) {
        return blockedError;
      }

      const isOtpValid = await this.hashingService.compare(
        verifySignUpOtpDto.otp,
        signUpOtp.otpHash,
      );

      if (!isOtpValid) {
        signUpOtp.verifyAttempts = (signUpOtp.verifyAttempts ?? 0) + 1;
        if (signUpOtp.verifyAttempts >= OTP_MAX_VERIFY_ATTEMPTS) {
          signUpOtp.verifyAttempts = 0;
          signUpOtp.blockedUntil = this.getBlockedUntilDate();
          await this.signUpOtpRepository.save(signUpOtp);
          return new BadRequestException(
            `Too many invalid attempts. Try again after ${OTP_BLOCK_DURATION_MINUTES} minutes.`,
          ).getResponse();
        }
        await this.signUpOtpRepository.save(signUpOtp);
        return new BadRequestException('Invalid OTP').getResponse();
      }

      const existingUser = await this.userRepository.findOneBy({
        email: verifySignUpOtpDto.email,
      });

      if (existingUser) {
        await this.signUpOtpRepository.delete({ id: signUpOtp.id });
        return new ConflictException('User already exists').getResponse();
      }

      const signUpResult = await this.createUserWithRole({
        email: signUpOtp.email,
        passwordHash: signUpOtp.passwordHash,
        role: signUpOtp.role,
      });

      const isSuccessResponse =
        typeof signUpResult === 'object' &&
        signUpResult !== null &&
        'status' in signUpResult &&
        signUpResult.status === true;

      if (!isSuccessResponse) {
        return signUpResult;
      }

      await this.signUpOtpRepository.delete({ id: signUpOtp.id });

      return signUpResult;
    } catch (error) {
      return new BadRequestException(error.message).getResponse();
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

    return await this.generateTokens(user);
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

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      const genericResponse = {
        status: true,
        message:
          'If the email exists, a password reset code has been sent to it.',
      };

      const user = await this.userRepository.findOneBy({
        email: forgotPasswordDto.email,
      });

      if (!user) {
        return genericResponse;
      }

      const passwordReset = await this.passwordResetRepository.findOneBy({
        email: forgotPasswordDto.email,
      });

      const resetRequestGuardError =
        this.getPasswordResetRequestGuardError(passwordReset);
      if (resetRequestGuardError) {
        if (passwordReset?.blockedUntil) {
          await this.passwordResetRepository.save(passwordReset);
        }
        return resetRequestGuardError;
      }

      if (passwordReset) {
        const sendError = await this.saveAndSendPasswordResetOtp(
          passwordReset,
          forgotPasswordDto.email,
        );
        if (sendError) {
          return sendError;
        }
      } else {
        const newResetRecord = this.passwordResetRepository.create({
          email: forgotPasswordDto.email,
          otpHash: '',
          expiresAt: this.getPasswordResetOtpExpiryDate(),
          requestWindowStartedAt: new Date(),
          requestCount: 0,
          verifyAttempts: 0,
        });
        const sendError = await this.saveAndSendPasswordResetOtp(
          newResetRecord,
          forgotPasswordDto.email,
        );
        if (sendError) {
          return sendError;
        }
      }

      return genericResponse;
    } catch (error) {
      return new BadRequestException(error.message).getResponse();
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const user = await this.userRepository.findOneBy({
        email: resetPasswordDto.email,
      });

      if (!user) {
        return new BadRequestException(
          'Invalid or expired password reset code',
        ).getResponse();
      }

      const passwordReset = await this.passwordResetRepository.findOneBy({
        email: resetPasswordDto.email,
      });

      if (!passwordReset) {
        return new BadRequestException(
          'Invalid or expired password reset code',
        ).getResponse();
      }

      if (new Date() > new Date(passwordReset.expiresAt)) {
        await this.passwordResetRepository.delete({ id: passwordReset.id });
        return new BadRequestException(
          'Invalid or expired password reset code',
        ).getResponse();
      }

      const resetBlockedError = this.getPasswordResetBlockedError(passwordReset);
      if (resetBlockedError) {
        return resetBlockedError;
      }

      const isOtpValid = await this.hashingService.compare(
        resetPasswordDto.otp,
        passwordReset.otpHash,
      );

      if (!isOtpValid) {
        passwordReset.verifyAttempts = (passwordReset.verifyAttempts ?? 0) + 1;
        if (passwordReset.verifyAttempts >= PASSWORD_RESET_MAX_VERIFY_ATTEMPTS) {
          passwordReset.verifyAttempts = 0;
          passwordReset.blockedUntil = this.getPasswordResetBlockedUntilDate();
          await this.passwordResetRepository.save(passwordReset);
          return new BadRequestException(
            `Too many invalid attempts. Try again after ${PASSWORD_RESET_BLOCK_DURATION_MINUTES} minutes.`,
          ).getResponse();
        }
        await this.passwordResetRepository.save(passwordReset);
        return new BadRequestException(
          'Invalid or expired password reset code',
        ).getResponse();
      }

      user.password = await this.hashingService.hash(resetPasswordDto.newPassword);
      await this.userRepository.save(user);
      await this.passwordResetRepository.delete({ id: passwordReset.id });
      await this.refreshTokenIdsStorage.invalidate(user.id);

      return {
        status: true,
        message: 'Password reset successful. Please sign in again.',
      };
    } catch (error) {
      return new BadRequestException(error.message).getResponse();
    }
  }

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getBlockedError(signUpOtp: SignUpOtp) {
    if (!signUpOtp.blockedUntil) {
      return null;
    }

    const now = new Date();
    if (now <= new Date(signUpOtp.blockedUntil)) {
      return new BadRequestException(
        'Too many OTP requests. Please try again later.',
      ).getResponse();
    }

    signUpOtp.blockedUntil = null;
    return null;
  }

  private getOtpRequestGuardError(signUpOtp: SignUpOtp | null) {
    if (!signUpOtp) {
      return null;
    }

    const blockedError = this.getBlockedError(signUpOtp);
    if (blockedError) {
      return blockedError;
    }

    if (
      signUpOtp.lastSentAt &&
      this.getSecondsSinceDate(signUpOtp.lastSentAt) < OTP_RESEND_COOLDOWN_SECONDS
    ) {
      return new BadRequestException(
        `Please wait ${OTP_RESEND_COOLDOWN_SECONDS} seconds before requesting another OTP.`,
      ).getResponse();
    }

    this.resetRequestWindowIfNeeded(signUpOtp);

    const nextRequestCount = (signUpOtp.otpRequestCount ?? 0) + 1;
    if (nextRequestCount > OTP_MAX_REQUESTS_PER_WINDOW) {
      signUpOtp.blockedUntil = this.getBlockedUntilDate();
      return new BadRequestException(
        `Too many OTP requests. Please try again after ${OTP_BLOCK_DURATION_MINUTES} minutes.`,
      ).getResponse();
    }

    return null;
  }

  private resetRequestWindowIfNeeded(signUpOtp: SignUpOtp) {
    const now = new Date();
    const windowStart = signUpOtp.requestWindowStartedAt
      ? new Date(signUpOtp.requestWindowStartedAt)
      : null;

    if (!windowStart || this.getMinutesBetween(windowStart, now) >= OTP_REQUEST_WINDOW_MINUTES) {
      signUpOtp.requestWindowStartedAt = now;
      signUpOtp.otpRequestCount = 0;
    }
  }

  private async saveAndSendOtp(
    signUpOtp: SignUpOtp,
    recipientEmail: string,
  ) {
    const otp = this.generateOtp();
    const otpHash = await this.hashingService.hash(otp);
    signUpOtp.otpHash = otpHash;
    signUpOtp.expiresAt = this.getOtpExpiryDate();
    signUpOtp.lastSentAt = new Date();
    signUpOtp.verifyAttempts = 0;
    signUpOtp.blockedUntil = null;

    this.resetRequestWindowIfNeeded(signUpOtp);
    signUpOtp.otpRequestCount = (signUpOtp.otpRequestCount ?? 0) + 1;

    await this.signUpOtpRepository.save(signUpOtp);

    try {
      await lastValueFrom(
        this.mailingClient
          .send<CreateMailerDto>('mailer.send', {
            to: recipientEmail,
            subject: 'Verify your GwaiPro account',
            text: `Your verification code is ${otp}. It expires in ${SIGN_UP_OTP_TTL_MINUTES} minutes.`,
          })
          .pipe(timeout(MAILER_RPC_TIMEOUT_MS)),
      );
    } catch (mailError) {
      return new BadRequestException(
        `OTP email could not be sent: ${mailError?.message ?? 'unknown error'}`,
      ).getResponse();
    }

    return null;
  }

  private getBlockedUntilDate(): Date {
    const blockedUntil = new Date();
    blockedUntil.setMinutes(blockedUntil.getMinutes() + OTP_BLOCK_DURATION_MINUTES);
    return blockedUntil;
  }

  private getSecondsSinceDate(date: Date): number {
    return Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  }

  private getMinutesBetween(start: Date, end: Date): number {
    return Math.floor((end.getTime() - start.getTime()) / 60000);
  }

  private getPasswordResetBlockedError(passwordReset: PasswordReset) {
    if (!passwordReset.blockedUntil) {
      return null;
    }

    const now = new Date();
    if (now <= new Date(passwordReset.blockedUntil)) {
      return new BadRequestException(
        'Too many password reset attempts. Please try again later.',
      ).getResponse();
    }

    passwordReset.blockedUntil = null;
    return null;
  }

  private getPasswordResetRequestGuardError(passwordReset: PasswordReset | null) {
    if (!passwordReset) {
      return null;
    }

    const blockedError = this.getPasswordResetBlockedError(passwordReset);
    if (blockedError) {
      return blockedError;
    }

    if (
      passwordReset.lastSentAt &&
      this.getSecondsSinceDate(passwordReset.lastSentAt) <
        PASSWORD_RESET_RESEND_COOLDOWN_SECONDS
    ) {
      return new BadRequestException(
        `Please wait ${PASSWORD_RESET_RESEND_COOLDOWN_SECONDS} seconds before requesting another reset code.`,
      ).getResponse();
    }

    this.resetPasswordResetRequestWindowIfNeeded(passwordReset);

    const nextRequestCount = (passwordReset.requestCount ?? 0) + 1;
    if (nextRequestCount > PASSWORD_RESET_MAX_REQUESTS_PER_WINDOW) {
      passwordReset.blockedUntil = this.getPasswordResetBlockedUntilDate();
      return new BadRequestException(
        `Too many reset code requests. Please try again after ${PASSWORD_RESET_BLOCK_DURATION_MINUTES} minutes.`,
      ).getResponse();
    }

    return null;
  }

  private resetPasswordResetRequestWindowIfNeeded(passwordReset: PasswordReset) {
    const now = new Date();
    const windowStart = passwordReset.requestWindowStartedAt
      ? new Date(passwordReset.requestWindowStartedAt)
      : null;

    if (!windowStart || this.getMinutesBetween(windowStart, now) >= PASSWORD_RESET_WINDOW_MINUTES) {
      passwordReset.requestWindowStartedAt = now;
      passwordReset.requestCount = 0;
    }
  }

  private async saveAndSendPasswordResetOtp(
    passwordReset: PasswordReset,
    recipientEmail: string,
  ) {
    const otp = this.generateOtp();
    const otpHash = await this.hashingService.hash(otp);

    passwordReset.otpHash = otpHash;
    passwordReset.expiresAt = this.getPasswordResetOtpExpiryDate();
    passwordReset.lastSentAt = new Date();
    passwordReset.verifyAttempts = 0;
    passwordReset.blockedUntil = null;

    this.resetPasswordResetRequestWindowIfNeeded(passwordReset);
    passwordReset.requestCount = (passwordReset.requestCount ?? 0) + 1;

    await this.passwordResetRepository.save(passwordReset);

    try {
      await lastValueFrom(
        this.mailingClient
          .send<CreateMailerDto>('mailer.send', {
            to: recipientEmail,
            subject: 'Reset your GwaiPro password',
            text: `Your password reset code is ${otp}. It expires in ${PASSWORD_RESET_OTP_TTL_MINUTES} minutes.`,
          })
          .pipe(timeout(MAILER_RPC_TIMEOUT_MS)),
      );
    } catch (mailError) {
      return new BadRequestException(
        `Reset email could not be sent: ${mailError?.message ?? 'unknown error'}`,
      ).getResponse();
    }

    return null;
  }

  private getPasswordResetBlockedUntilDate(): Date {
    const blockedUntil = new Date();
    blockedUntil.setMinutes(
      blockedUntil.getMinutes() + PASSWORD_RESET_BLOCK_DURATION_MINUTES,
    );
    return blockedUntil;
  }

  private getPasswordResetOtpExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + PASSWORD_RESET_OTP_TTL_MINUTES);
    return expiresAt;
  }

  private getOtpExpiryDate(): Date {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + SIGN_UP_OTP_TTL_MINUTES);
    return expiresAt;
  }

  private isValidRole(role: string): role is Role {
    return Object.values(Role).includes(role as Role);
  }

  private async createUserWithRole({
    email,
    passwordHash,
    role,
  }: {
    email: string;
    passwordHash: string;
    role: Role;
  }) {
    const queryRunner =
      this.userRepository.manager.connection.createQueryRunner();
    await queryRunner.startTransaction();
    try {
      const user = this.userRepository.create({
        email,
        password: passwordHash,
        role,
      });

      await queryRunner.manager.save(user);

      if (role === Role.Client) {
        const client = this.clientRepository.create({
          user,
        });
        await queryRunner.manager.save(client);
      } else if (role === Role.Musician) {
        const musician = this.musicianRepository.create({
          user,
        });
        await queryRunner.manager.save(musician);
      } else if (role === Role.Studio) {
        const studio = this.studioRepository.create({
          user,
        });
        await queryRunner.manager.save(studio);
      } else if (role === Role.Admin) {
        const admin = this.adminRepository.create({
          user,
        });
        await queryRunner.manager.save(admin);
      } else {
        return new UnauthorizedException().getResponse();
      }

      await queryRunner.commitTransaction();

      return {
        status: true,
        message: `${user.role} signed up successfully`,
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
