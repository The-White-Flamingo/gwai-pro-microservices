import { Auth, AuthType, RefreshTokenDto, SignInDto, SignUpDto } from '@app/iam';
import { Body, Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('auth')
@Auth(AuthType.None)
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authenticationService: AuthService,
  ) { }

  @Post('sign-up')
  @UseInterceptors(FileInterceptor('avatar'))
  signUp(@Body() signUpDto: SignUpDto, @UploadedFile() file: Express.Multer.File) {
    // signUpDto.avatar = file?.buffer.toString('base64');

    return this.authenticationService.signUp(signUpDto);
  }

  @Post('sign-in')
  signIn(@Body() signInDto: SignInDto) {
    return this.authenticationService.signIn(signInDto);
  }

  @Post('refresh-tokens')
  refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authenticationService.refreshTokens(refreshTokenDto);
  }
}