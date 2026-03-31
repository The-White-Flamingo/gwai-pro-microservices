import {
  ConflictException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticationService } from '../authentication.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../users/entities/user.entity';

type FirebaseDecodedToken = {
  uid: string;
  email?: string;
  email_verified?: boolean;
  firebase?: {
    sign_in_provider?: string;
  };
};

type FirebaseAdminModule = {
  apps: Array<unknown>;
  app: (name?: string) => unknown;
  credential: {
    cert: (serviceAccount: Record<string, unknown>) => unknown;
  };
  initializeApp: (
    options: {
      credential: unknown;
      projectId?: string;
    },
    name?: string,
  ) => unknown;
  auth: (app?: unknown) => {
    verifyIdToken: (
      token: string,
      checkRevoked?: boolean,
    ) => Promise<FirebaseDecodedToken>;
  };
};

@Injectable()
export class FirebaseAuthenticationService implements OnModuleInit {
  private firebaseApp?: unknown;

  constructor(
    private readonly configService: ConfigService,
    private readonly authenticationService: AuthenticationService,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  onModuleInit() {
    this.firebaseApp = this.initializeFirebaseApp();
  }

  async authenticate(token: string) {
    try {
      const firebaseAdmin = this.getFirebaseAdmin();
      const firebaseApp = this.firebaseApp ?? this.initializeFirebaseApp();

      if (!firebaseApp) {
        throw new UnauthorizedException('Firebase auth is not configured');
      }

      const decodedToken = await firebaseAdmin
        .auth(firebaseApp)
        .verifyIdToken(token, true);

      if (!decodedToken.uid || !decodedToken.email || decodedToken.email_verified !== true) {
        throw new UnauthorizedException('Invalid Firebase token');
      }

      const user = await this.findOrCreateUser(decodedToken);
      const tokens = await this.authenticationService.generateTokens(user);

      return {
        status: true,
        message: 'Firebase authentication successful',
        ...tokens,
      };
    } catch (error) {
      if (
        error instanceof UnauthorizedException ||
        error instanceof ConflictException
      ) {
        throw error;
      }

      throw new UnauthorizedException(
        error?.message ?? 'Firebase authentication failed',
      );
    }
  }

  private async findOrCreateUser(decodedToken: FirebaseDecodedToken) {
    const existingByFirebaseUid = await this.userRepository.findOneBy({
      firebaseUid: decodedToken.uid,
    });
    if (existingByFirebaseUid) {
      return existingByFirebaseUid;
    }

    const existingByEmail = await this.userRepository.findOneBy({
      email: decodedToken.email,
    });

    if (existingByEmail) {
      if (
        existingByEmail.firebaseUid &&
        existingByEmail.firebaseUid !== decodedToken.uid
      ) {
        throw new ConflictException(
          'Firebase account already linked to another user',
        );
      }

      existingByEmail.firebaseUid = decodedToken.uid;
      return this.userRepository.save(existingByEmail);
    }

    return this.userRepository.save(
      this.userRepository.create({
        email: decodedToken.email,
        firebaseUid: decodedToken.uid,
      }),
    );
  }

  private initializeFirebaseApp() {
    const serviceAccount = this.getServiceAccount();
    if (!serviceAccount) {
      return undefined;
    }

    const firebaseAdmin = this.getFirebaseAdmin();

    if (firebaseAdmin.apps.length > 0) {
      return firebaseAdmin.app();
    }

    return firebaseAdmin.initializeApp({
      credential: firebaseAdmin.credential.cert(serviceAccount),
      projectId:
        typeof serviceAccount.projectId === 'string'
          ? serviceAccount.projectId
          : undefined,
    });
  }

  private getServiceAccount() {
    const rawJson = this.configService
      .get<string>('FIREBASE_SERVICE_ACCOUNT_JSON')
      ?.trim();

    if (rawJson) {
      try {
        return JSON.parse(rawJson) as Record<string, unknown>;
      } catch {
        throw new UnauthorizedException(
          'FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON',
        );
      }
    }

    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail =
      this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      return undefined;
    }

    return {
      projectId,
      clientEmail,
      privateKey,
    };
  }

  private getFirebaseAdmin(): FirebaseAdminModule {
    try {
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      return require('firebase-admin') as FirebaseAdminModule;
    } catch {
      throw new UnauthorizedException(
        'firebase-admin package is not installed',
      );
    }
  }
}
