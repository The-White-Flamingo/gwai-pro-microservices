import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { CreateMailerDto } from '@app/shared';
import { EmailProvider } from '../interfaces/email-provider.interface';
import { log } from 'console';

@Injectable()
export class ZohoProvider implements EmailProvider {
  constructor(private readonly configService: ConfigService) {}

  async sendEmail(createMailerDto: CreateMailerDto) {
    const smtpHost = this.configService.get('ZOHO_SMTP_HOST', 'smtp.zoho.com');
    const smtpPort = this.configService.get<number>('ZOHO_SMTP_PORT', 465);
    const smtpUser = this.configService.get('ZOHO_SMTP_USER');
    const smtpPass = this.configService.get('ZOHO_SMTP_PASS');

    console.log(smtpHost, smtpPort, smtpUser, smtpPass)

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: true,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      logger: true,
      debug: true,
    });

    const mailOptions = {
      ...createMailerDto,
      from: `Gwaipro <${smtpUser}>`,
      to: createMailerDto.to,
    };

    try {
      await transporter.sendMail(mailOptions);
      return {
        status: true,
        message: 'Email was sent successfully',
      };
    } catch (error) {
      throw new BadRequestException(`Failed to send email: ${error.message}`);
    }
  }
}
