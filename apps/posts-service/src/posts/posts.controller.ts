import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostsService } from './posts.service';
import { CreatePostDto, UpdatePostDto } from '@app/posts';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @MessagePattern('posts.create')
  create(@Payload() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @MessagePattern('posts.findAll')
  findAll() {
    return this.postsService.findAll();
  }

  @MessagePattern('posts.findOne')
  findOne(@Payload() id: string) {
    return this.postsService.findOne(id);
  }

  @MessagePattern('posts.update')
  update(@Payload() updatePostDto: UpdatePostDto) {
    return this.postsService.update(updatePostDto);
  }

  @MessagePattern('posts.remove')
  remove(@Payload() id: string) {
    return this.postsService.remove(id);
  }
}
