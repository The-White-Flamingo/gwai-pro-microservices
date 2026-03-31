import {
  AppleTokenDto,
  FirebaseTokenDto,
  ForgotPasswordDto,
  GoogleTokenDto,
  RequestAuthOtpDto,
  ResendSignUpOtpDto,
  ResetPasswordDto,
  RefreshTokenDto,
  SignInDto,
  SignUpDto,
  VerifyAuthOtpDto,
  VerifySignUpOtpDto,
} from '@app/iam';
import { USERS_SERVICE } from '@app/shared';
import {
  BadRequestException,
  ConflictException,
  GatewayTimeoutException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout, TimeoutError } from 'rxjs';

@Injectable()
export class AuthService {
  private static readonly RMQ_TIMEOUT_MS = 15000;

  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

  private async sendWithTimeout<T>(pattern: string, payload: unknown): Promise<T> {
    try {
      return await lastValueFrom(
        this.client
          .send<T>(pattern, payload)
          .pipe(timeout(AuthService.RMQ_TIMEOUT_MS)),
      );
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          `Request to users-service timed out for pattern ${pattern}`,
        );
      }
      throw error;
    }
  }

  private mapIdentifierToRequest(identifier: string): RequestAuthOtpDto {
    const normalizedIdentifier = identifier.trim();

    if (normalizedIdentifier.includes('@')) {
      return { email: normalizedIdentifier.toLowerCase() };
    }

    return { username: normalizedIdentifier.toLowerCase() };
  }

  private getErrorStatus(error: any): number | undefined {
    return error?.response?.statusCode ?? error?.status;
  }

  private getErrorMessage(error: any): string {
    return (
      error?.response?.message ??
      error?.message ??
      error?.error?.message ??
      (typeof error === 'string' ? error : JSON.stringify(error))
    );
  }

  private rethrowMappedError(error: any): never {
    if (error instanceof GatewayTimeoutException) {
      throw error;
    }

    const status = this.getErrorStatus(error);
    const message = this.getErrorMessage(error);

    if (status === 401 || error instanceof UnauthorizedException) {
      throw new UnauthorizedException(message);
    }
    if (status === 404 || error instanceof NotFoundException) {
      throw new NotFoundException(message);
    }
    if (status === 409 || error instanceof ConflictException) {
      throw new ConflictException(message);
    }
    if (status === 503 || error instanceof ServiceUnavailableException) {
      throw new ServiceUnavailableException(message);
    }

    throw new BadRequestException(message);
  }

  async signUp(signUpDto: SignUpDto) {
    try {
      const user = await this.sendWithTimeout('auth.requestOtp', signUpDto);
      return user;
    } catch (error) {
      this.rethrowMappedError(error);
    }
  }

  async signIn(signInDto: SignInDto) {
    try {
      const user = await this.sendWithTimeout(
        'auth.requestOtp',
        this.mapIdentifierToRequest(signInDto.identifier),
      );
      return user;
    } catch (error) {
      this.rethrowMappedError(error);
    }
  }

  async verifySignUpOtp(verifySignUpOtpDto: VerifySignUpOtpDto) {
    try {
      return await this.sendWithTimeout(
        'auth.verifyOtp',
        verifySignUpOtpDto,
      );
    } catch (error) {
      this.rethrowMappedError(error);
    }
  }

  async resendSignUpOtp(resendSignUpOtpDto: ResendSignUpOtpDto) {
    try {
      return await this.sendWithTimeout(
        'auth.requestOtp',
        this.mapIdentifierToRequest(resendSignUpOtpDto.identifier),
      );
    } catch (error) {
      this.rethrowMappedError(error);
    }
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto) {
    try {
      const tokens = await this.sendWithTimeout(
        'auth.refreshTokens',
        refreshTokenDto,
      );
      return tokens;
    } catch (error) {
      this.rethrowMappedError(error);
    }
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    try {
      return await this.sendWithTimeout(
        'auth.forgotPassword',
        forgotPasswordDto,
      );
    } catch (error) {
      this.rethrowMappedError(error);
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      return await this.sendWithTimeout(
        'auth.resetPassword',
        resetPasswordDto,
      );
    } catch (error) {
      this.rethrowMappedError(error);
    }
  }

  async authenticateWithGoogle(googleTokenDto: GoogleTokenDto) {
    try {
      return await this.sendWithTimeout('auth.google', googleTokenDto);
    } catch (error) {
      this.rethrowMappedError(error);
    }
  }

  async authenticateWithApple(appleTokenDto: AppleTokenDto) {
    try {
      return await this.sendWithTimeout('auth.apple', appleTokenDto);
    } catch (error) {
      this.rethrowMappedError(error);
    }
  }

  async authenticateWithFirebase(firebaseTokenDto: FirebaseTokenDto) {
    try {
      return await this.sendWithTimeout('auth.firebase', firebaseTokenDto);
    } catch (error) {
      this.rethrowMappedError(error);
    }
  }

  async requestOtp(requestAuthOtpDto: RequestAuthOtpDto) {
    try {
      return await this.sendWithTimeout('auth.requestOtp', requestAuthOtpDto);
    } catch (error) {
      this.rethrowMappedError(error);
    }
  }

  async verifyOtp(verifyAuthOtpDto: VerifyAuthOtpDto) {
    try {
      return await this.sendWithTimeout('auth.verifyOtp', verifyAuthOtpDto);
    } catch (error) {
      this.rethrowMappedError(error);
    }
  }
}
