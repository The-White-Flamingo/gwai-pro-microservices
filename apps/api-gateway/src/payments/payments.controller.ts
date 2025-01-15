import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActiveUser, ActiveUserData, Auth, AuthType } from '@app/iam';
import {
  CreatePaymentDto,
  PaystackWebhookDto,
  UpdatePaymentDto,
  VerifyPaymentDto,
} from '@app/payments';

@ApiTags('payments')
@ApiBearerAuth()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Auth(AuthType.Bearer)
  @ApiBearerAuth()
  @Get()
  findAll() {
    return this.paymentsService.findAll();
  }

  @Auth(AuthType.Bearer)
  @ApiBearerAuth()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.paymentsService.findOne(id);
  }

  @Auth(AuthType.Bearer)
  @ApiBearerAuth()
  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePaymentDto: UpdatePaymentDto) {
    return this.paymentsService.update(id, updatePaymentDto);
  }

  @Auth(AuthType.Bearer)
  @ApiBearerAuth()
  @Post('initialize')
  initialize(
    @Body() createPaymentDto: CreatePaymentDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.paymentsService.initialize(createPaymentDto, user);
  }

  @Auth(AuthType.None)
  @Post('callback')
  verify(@Query() verifyPaymentDto: VerifyPaymentDto) {
    return this.paymentsService.verify(verifyPaymentDto);
  }

  @Auth(AuthType.None)
  @Post('webhook')
  webhook(@Body() paystackWebhookDto: PaystackWebhookDto) {
    return this.paymentsService.webhook(paystackWebhookDto);
  }
}
