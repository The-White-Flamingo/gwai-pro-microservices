import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import {
    HealthCheckService,
    TypeOrmHealthIndicator,
    HealthCheck,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
    constructor(
        private health: HealthCheckService,
        private db: TypeOrmHealthIndicator,
    ) { }

    @MessagePattern('posts.health')
    @HealthCheck()
    check() {
        return this.health.check([() => this.db.pingCheck('database')]);
    }
}
