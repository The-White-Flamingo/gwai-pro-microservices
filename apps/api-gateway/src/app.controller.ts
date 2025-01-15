import { Controller, Get } from '@nestjs/common';
import { ApiGatewayService } from './app.service';
import { Auth, AuthType } from '@app/iam';

@Controller()
export class ApiGatewayController {
  constructor(private readonly apiGatewayService: ApiGatewayService) {}

  @Auth(AuthType.None)
  @Get()
  getHello(): string {
    return this.apiGatewayService.getHello();
  }
}
