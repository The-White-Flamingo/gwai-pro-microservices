import { Injectable } from '@nestjs/common';

@Injectable()
export class PostsServiceService {
  getHello(): string {
    return 'Hello World!';
  }
}
