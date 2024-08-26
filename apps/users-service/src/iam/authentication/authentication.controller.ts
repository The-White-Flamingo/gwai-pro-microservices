import { AuthenticationService } from './authentication.service';
import { OtpAuthenticationService } from './otp-authentication.service';
import { Response } from 'express';
import { toFileStream } from 'qrcode';
import { ActiveUser, ActiveUserData, Auth, AuthType, RefreshTokenDto, SignInDto, SignUpDto } from '@app/iam';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';

@Auth(AuthType.None)
@Controller('auth')
export class AuthenticationController {
    constructor(private readonly authenticationService: AuthenticationService, private readonly otpAuthenticationService: OtpAuthenticationService) { }

    @MessagePattern('auth.signUp')
    signUp(@Payload() signUpDto: SignUpDto) {
        return this.authenticationService.signUp(signUpDto);
    }

    @MessagePattern('auth.signIn')
    signIn(@Payload() signInDto: SignInDto) {
        return this.authenticationService.signIn(signInDto);
    }

    @MessagePattern('auth.refreshTokens')
    refreshTokens(@Payload() refreshTokenDto: RefreshTokenDto) {
        return this.authenticationService.refreshTokens(refreshTokenDto);
    }

    // @MessagePattern('2fa/generate')
    // async generateQrCode(
    //     @ActiveUser() activeUser: ActiveUserData,
    //     @Res() response: Response,
    // ) {
    //     const { secret, uri } = await this.otpAuthenticationService.generateSecret(activeUser.email);

    //     await this.otpAuthenticationService.enableTfaForUser(activeUser.email, secret);

    //     response.type('png');

    //     return toFileStream(response, uri);
    // }
}
