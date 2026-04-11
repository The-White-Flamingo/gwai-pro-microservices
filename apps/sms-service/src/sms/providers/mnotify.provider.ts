import axios from 'axios';
import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CreateSmsDto } from '@app/shared';
import { SmsProvider } from '../interfaces/sms-provider.interface';

type MnotifySmsResponse = {
  status?: string;
  code?: string;
  message?: string;
  summary?: {
    _id?: string;
    type?: string;
    total_sent?: number;
    contacts?: number;
    total_rejected?: number;
    numbers_sent?: string[];
    credit_used?: number;
    credit_left?: number;
  };
};

@Injectable()
export class MnotifyProvider implements SmsProvider {
  private static readonly REQUEST_TIMEOUT_MS = 10000;

  constructor(private readonly configService: ConfigService) {}

  async sendSms(createSmsDto: CreateSmsDto) {
    const apiKey = this.configService.get<string>('MNOTIFY_API_KEY')?.trim();
    const senderId =
      createSmsDto.senderId?.trim() ||
      this.configService.get<string>('MNOTIFY_SENDER_ID')?.trim();
    const baseUrl =
      this.configService.get<string>('MNOTIFY_BASE_URL')?.trim() ||
      'https://api.mnotify.com/api';

    if (!apiKey) {
      throw new InternalServerErrorException('MNotify API key is not configured');
    }

    if (!senderId) {
      throw new InternalServerErrorException(
        'MNotify sender ID is not configured',
      );
    }

    try {
      const response = await axios.post<MnotifySmsResponse>(
        `${baseUrl}/sms/quick?key=${encodeURIComponent(apiKey)}`,
        {
          recipient: [this.normalizePhoneNumber(createSmsDto.to)],
          sender: senderId,
          message: createSmsDto.message,
          is_schedule: false,
          ...(createSmsDto.purpose === 'otp' ? { sms_type: 'otp' } : {}),
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: MnotifyProvider.REQUEST_TIMEOUT_MS,
        },
      );

      if (response.data?.status?.toLowerCase() !== 'success') {
        throw new ServiceUnavailableException(
          response.data?.message ?? 'MNotify rejected the SMS request',
        );
      }

      return {
        status: true,
        message: response.data.message ?? 'SMS sent successfully',
        provider: 'mnotify',
        data: response.data,
      };
    } catch (error) {
      if (
        error instanceof InternalServerErrorException ||
        error instanceof ServiceUnavailableException
      ) {
        throw error;
      }

      throw new ServiceUnavailableException(
        error?.response?.data?.message ??
          error?.message ??
          'Failed to send SMS with MNotify',
      );
    }
  }

  private normalizePhoneNumber(phoneNumber: string) {
    return phoneNumber.trim().replace(/\D/g, '');
  }
}
