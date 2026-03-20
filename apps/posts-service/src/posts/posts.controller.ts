import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostsService } from './posts.service';
import { CreatePostDto, FindPostQueryDto, UpdatePostDto } from '@app/posts';
import { PaginationQueryDto } from '@app/shared';
import { ActiveUserData } from '@app/iam';

type FindAllPayload = {
  paginationQueryDto?: PaginationQueryDto;
  findPostQueryDto?: FindPostQueryDto;
  activeUser?: ActiveUserData;
};

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @MessagePattern('posts.create')
  create(@Payload() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @MessagePattern('posts.findAll')
  findAll(@Payload() payload: FindAllPayload) {
    return this.postsService.findAll(
      payload?.paginationQueryDto ?? ({} as PaginationQueryDto),
      payload?.findPostQueryDto ?? ({} as FindPostQueryDto),
      payload?.activeUser as ActiveUserData,
    );
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