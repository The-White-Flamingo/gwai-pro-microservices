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
export class StudiosService {
  private static readonly RMQ_TIMEOUT_MS = 15000;

  constructor(@Inject(USERS_SERVICE) private readonly client: ClientProxy) {}

  async create(createStudioDto: any, userId: string) {
    try {
      const result = await lastValueFrom(
        this.client
          .send('createStudio', { ...createStudioDto, userId })
          .pipe(timeout(StudiosService.RMQ_TIMEOUT_MS)),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          'Request to users-service timed out for pattern createStudio',
        );
      }
      if (error instanceof UnauthorizedException) {
        throw new UnauthorizedException(this.getErrorMessage(error));
      }
      throw new BadRequestException(this.getErrorMessage(error));
    }
  }

  async update(updateStudioDto: any, userId: string) {
    try {
      const result = await lastValueFrom(
        this.client
          .send('updateStudioProfile', { ...updateStudioDto, userId })
          .pipe(timeout(StudiosService.RMQ_TIMEOUT_MS)),
      );
      return result;
    } catch (error) {
      if (error instanceof TimeoutError) {
        throw new GatewayTimeoutException(
          'Request to users-service timed out for pattern updateStudioProfile',
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
