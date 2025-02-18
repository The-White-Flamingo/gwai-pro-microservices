import { Controller, Query } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PostsService } from './posts.service';
import { CreatePostDto, FindPostQueryDto, UpdatePostDto } from '@app/posts';
import { PaginationQueryDto } from '@app/shared';
import { ActiveUser, ActiveUserData } from '@app/iam';

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @MessagePattern('posts.create')
  create(@Payload() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @MessagePattern('posts.findAll')
  findAll(@Query() paginationQueryDto: PaginationQueryDto, @Query() findPostQueryDto: FindPostQueryDto, @ActiveUser() activeUser: ActiveUserData) {
    return this.postsService.findAll(paginationQueryDto, findPostQueryDto, activeUser);
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
