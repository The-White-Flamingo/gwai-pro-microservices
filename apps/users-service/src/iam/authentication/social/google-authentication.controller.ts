import { Body, Controller, Post } from '@nestjs/common';
import { GoogleAuthenticationService } from './google-authentication.service';
import { Auth, AuthType, GoogleTokenDto } from '@app/iam';

@Auth(AuthType.None)
@Controller('auth/google')
export class GoogleAuthenticationController {
    constructor(
        private readonly googleAuthenticationService: GoogleAuthenticationService,
    ) { }

    @Post()
    authenticate(@Body() tokenDto: GoogleTokenDto) {
        return this.googleAuthenticationService.authenticate(tokenDto.token);
    }
}
