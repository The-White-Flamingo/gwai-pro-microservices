import { USERS_SERVICE } from '@app/shared';
import {
  BadRequestException,
  GatewayTimeoutException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { lastValueFrom, timeout, TimeoutError } from 'rxjs';

@Injectable()
export class ClientsService {
  private static readonly RMQ_TIMEOUT_MS = 15000;

  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

  async create(createClientDto: any) {
    try {
      const result = await lastValueFrom(
        this.client
          .send('createClient', createClientDto)
          .pipe(timeout(ClientsService.RMQ_TIMEOUT_MS)),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          'Request to users-service timed out for pattern createClient',
        );
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  private getErrorMessage(error: any): string {
    return (
      error?.response?.message ??
      error?.message ??
      error?.error?.message ??
      (typeof error === 'string' ? error : JSON.stringify(error))
    );
  }
}
