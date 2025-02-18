import { CreateMailerDto } from '@app/shared';

export interface EmailProvider {
  sendEmail(
    createMailerDto: CreateMailerDto,
  ): Promise<{ status: boolean; message: string }>;
}
