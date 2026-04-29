import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticationService } from '../authentication.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { webcrypto } from 'node:crypto';

type AppleTokenHeader = {
  alg: string;
  kid: string;
};

type AppleTokenPayload = {
  aud: string;
  email?: string;
  email_verified?: boolean | string;
  exp: number;
  iat?: number;
  iss: string;
  sub: string;
};

@Injectable()
export class AppleAuthenticationService {
  private readonly appleKeysUrl = 'https://appleid.apple.com/auth/keys';
  private readonly publicKeyCache = new Map<string, any>();

  constructor(
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async authenticate(token: string) {
    try {
      const parsedToken = this.parseIdentityToken(token);
      await this.verifyIdentityToken(parsedToken);

      const user = await this.findOrCreateUser({
        appleId: parsedToken.payload.sub,
        email: parsedToken.payload.email,
        emailVerified:
          parsedToken.payload.email_verified === true ||
          parsedToken.payload.email_verified === 'true',
      });

      return this.authenticationService.generateTokens(user);
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      throw new UnauthorizedException(error?.message ?? 'Apple authentication failed');
    }
  }

  private parseIdentityToken(token: string) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new UnauthorizedException('Invalid Apple token');
    }

    const [headerSegment, payloadSegment, signatureSegment] = parts;

    return {
      header: this.parseSegment<AppleTokenHeader>(headerSegment),
      payload: this.parseSegment<AppleTokenPayload>(payloadSegment),
      signature: this.base64UrlToBuffer(signatureSegment),
      signingInput: Buffer.from(
        `${headerSegment}.${payloadSegment}`,
        'utf8',
      ),
    };
  }

  private async verifyIdentityToken(parsedToken: {
    header: AppleTokenHeader;
    payload: AppleTokenPayload;
    signature: Buffer;
    signingInput: Buffer;
  }) {
    const audiences = this.getAudiences();
    if (audiences.length === 0) {
      throw new UnauthorizedException('Apple auth is not configured');
    }

    const { header, payload, signature, signingInput } = parsedToken;

    if (header.alg !== 'RS256' || !header.kid) {
      throw new UnauthorizedException('Invalid Apple token header');
    }

    if (payload.iss !== 'https://appleid.apple.com') {
      throw new UnauthorizedException('Invalid Apple issuer');
    }

    if (!payload.aud || !audiences.includes(payload.aud)) {
      throw new UnauthorizedException('Invalid Apple audience');
    }

    if (!payload.sub) {
      throw new UnauthorizedException('Invalid Apple subject');
    }

    if (!payload.exp || Date.now() >= payload.exp * 1000) {
      throw new UnauthorizedException('Apple token has expired');
    }

    const publicKey = await this.getPublicKey(header.kid);
    const isValid = await webcrypto.subtle.verify(
      { name: 'RSASSA-PKCS1-v1_5' },
      publicKey,
      signature,
      signingInput,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid Apple token signature');
    }
  }

  private getAudiences(): string[] {
    const clientIds = this.configService.get<string>('APPLE_CLIENT_ID') ?? '';
    return clientIds
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean);
  }

  private async getPublicKey(kid: string) {
    const cachedKey = this.publicKeyCache.get(kid);
    if (cachedKey) {
      return cachedKey;
    }

    const response = await fetch(this.appleKeysUrl);
    if (!response.ok) {
      throw new UnauthorizedException('Unable to fetch Apple public keys');
    }

    const body = (await response.json()) as { keys?: Array<any> };
    const jwk = body.keys?.find((key) => key.kid === kid);
    if (!jwk) {
      throw new UnauthorizedException('No matching Apple public key found');
    }

    const importedKey = await webcrypto.subtle.importKey(
      'jwk',
      jwk,
      {
        name: 'RSASSA-PKCS1-v1_5',
        hash: 'SHA-256',
      },
      false,
      ['verify'],
    );

    this.publicKeyCache.set(kid, importedKey);
    return importedKey;
  }

  private async findOrCreateUser(params: {
    appleId: string;
    email?: string;
    emailVerified: boolean;
  }) {
    const existingByAppleId = await this.userRepository.findOneBy({
      appleId: params.appleId,
    });
    if (existingByAppleId) {
      return existingByAppleId;
    }

    if (params.email && params.emailVerified) {
      const existingByEmail = await this.userRepository.findOneBy({
        email: params.email,
      });

      if (existingByEmail) {
        if (
          existingByEmail.appleId &&
          existingByEmail.appleId !== params.appleId
        ) {
          throw new ConflictException(
            'Apple account already linked to another user',
          );
        }

        existingByEmail.appleId = params.appleId;
        return this.userRepository.save(existingByEmail);
      }
    }

    if (!params.email) {
      throw new UnauthorizedException(
        'Apple token did not include an email for first-time sign-in',
      );
    }

    if (!params.emailVerified) {
      throw new UnauthorizedException('Apple email is not verified');
    }

    return this.userRepository.save(
      this.userRepository.create({
        appleId: params.appleId,
        email: params.email,
      }),
    );
  }

  private parseSegment<T>(segment: string): T {
    try {
      return JSON.parse(this.base64UrlToBuffer(segment).toString('utf8')) as T;
    } catch {
      throw new UnauthorizedException('Invalid Apple token');
    }
  }

  private base64UrlToBuffer(value: string): Buffer {
    const normalizedValue = value.replace(/-/g, '+').replace(/_/g, '/');
    const paddedValue = normalizedValue.padEnd(
      Math.ceil(normalizedValue.length / 4) * 4,
      '=',
    );
    return Buffer.from(paddedValue, 'base64');
  }
}
