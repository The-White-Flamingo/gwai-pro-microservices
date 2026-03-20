import { BadRequestException, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { CreateMailerDto } from '@app/shared';
import { EmailProvider } from '../interfaces/email-provider.interface';

@Injectable()
export class GmailProvider implements EmailProvider {
    constructor(private readonly configService: ConfigService) { }

    async sendEmail(createMailerDto: CreateMailerDto) {
        const smtpService = this.configService.get('GMAIL_SMTP_SERVICE', 'gmail');
        const smtpUser = this.configService.get('GMAIL_SMTP_USER');
        const smtpPass = this.configService.get('GMAIL_SMTP_PASS');

        const transporter = nodemailer.createTransport({
            service: smtpService,
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
