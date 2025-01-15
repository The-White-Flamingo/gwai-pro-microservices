import { Controller, Get } from '@nestjs/common';
import { PostsServiceService } from './app.service';

@Controller()
export class PostsServiceController {
  constructor(private readonly postsServiceService: PostsServiceService) {}

  @Get()
  getHello(): string {
    return this.postsServiceService.getHello();
  }
}
