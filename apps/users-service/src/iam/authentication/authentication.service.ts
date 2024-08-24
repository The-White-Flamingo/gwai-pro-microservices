import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
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
import { InvalidatedRefreshTokenError, RefreshTokenIdsStorage } from './refresh-token-ids.storage';
import { randomUUID } from 'crypto';
import { OtpAuthenticationService } from './otp-authentication.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class AuthenticationService {
    constructor(
        @InjectRepository(User) private readonly userRepository: Repository<User>,
        private readonly hashingService: HashingService,
        private readonly jwtService: JwtService,
        @Inject(jwtConfig.KEY) private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
        private readonly refreshTokenIdsStorage: RefreshTokenIdsStorage,
        private readonly otpAuthenticationService: OtpAuthenticationService,
    ) { }

    async signUp(signUpDto: SignUpDto) {
        try {
            const user = this.userRepository.create({
                ...signUpDto,
                password: await this.hashingService.hash(signUpDto.password),
            });

            await this.userRepository.save(user);

            return await this.generateTokens(user);
        } catch (error) {
            const pgUniqueViolationErrorCode = '23505';
            if (error.code === pgUniqueViolationErrorCode) {
                throw new ConflictException();
            }
            throw new BadRequestException(error.message);
        }
    }

    async signIn(signInDto: SignInDto) {
        const user = await this.userRepository.findOneBy({
            email: signInDto.email,
        });

        if (!user) {
            throw new UnauthorizedException('User does not exist');
        }

        const passwordIsValid = await this.hashingService.compare(
            signInDto.password,
            user.password,
        );

        if (!passwordIsValid) {
            throw new UnauthorizedException('Password does not match');
        }

        if (user.isTfaEnabled) {
            const isValid = this.otpAuthenticationService.verifyCode(
                signInDto.tfaCode,
                user.tfaSecret,
            );

            if (!isValid) {
                throw new UnauthorizedException('Invalid 2FA code');
            }
        }

        return await this.generateTokens(user);
    }

    async generateTokens(user: User) {
        const refreshTokenId = randomUUID();
        const [accessToken, refreshToken] = await Promise.all([
            this.signToken<Partial<ActiveUserData>>(
                user.id,
                this.jwtConfiguration.accessTokenTtl,
                { email: user.email, role: user.role }
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
                issuer: this.jwtConfiguration.issuer
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
                throw new Error('Refresh toekn is invalid');
            }

            return await this.generateTokens(user);
        } catch (error) {
            if (error instanceof InvalidatedRefreshTokenError) {
                throw new UnauthorizedException('Access denied');
            }
            throw new UnauthorizedException();
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
                expiresIn: this.jwtConfiguration.accessTokenTtl,
            }
        );
    }
}
