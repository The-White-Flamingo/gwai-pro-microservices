import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import {
  CreateCommentDto,
  CreatePostDto,
  FindPostQueryDto,
  FollowUserDto,
  ReportPostDto,
  ToggleLikeDto,
  UpdatePostDto,
} from '@app/posts';
import { PaginationQueryDto } from '@app/shared';
import { ActiveUserData } from '@app/iam';
import { PostsService } from './posts.service';

type FeedQueryPayload = {
  paginationQueryDto?: PaginationQueryDto;
  findPostQueryDto?: FindPostQueryDto;
  activeUser?: ActiveUserData;
};

type FindOnePayload = {
  id: string;
  activeUser?: ActiveUserData;
};

type RemovePayload = {
  id: string;
  activeUser: ActiveUserData;
};

@Controller()
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @MessagePattern('posts.create')
  create(@Payload() createPostDto: CreatePostDto) {
    return this.postsService.create(createPostDto);
  }

  @MessagePattern('posts.findAll')
  findAll(@Payload() payload: FeedQueryPayload) {
    return this.postsService.findAll(
      payload?.paginationQueryDto ?? ({} as PaginationQueryDto),
      payload?.findPostQueryDto ?? ({} as FindPostQueryDto),
      payload?.activeUser as ActiveUserData,
    );
  }

  @MessagePattern('posts.findFollowingFeed')
  findFollowingFeed(@Payload() payload: FeedQueryPayload) {
    return this.postsService.findFollowingFeed(
      payload?.paginationQueryDto ?? ({} as PaginationQueryDto),
      payload?.activeUser as ActiveUserData,
    );
  }

  @MessagePattern('posts.findOne')
  findOne(@Payload() payload: FindOnePayload) {
    return this.postsService.findOne(payload.id, payload.activeUser);
  }

  @MessagePattern('posts.update')
  update(@Payload() updatePostDto: UpdatePostDto) {
    return this.postsService.update(updatePostDto);
  }

  @MessagePattern('posts.remove')
  remove(@Payload() payload: RemovePayload) {
    return this.postsService.remove(payload.id, payload.activeUser);
  }

  @MessagePattern('posts.toggleLike')
  toggleLike(@Payload() toggleLikeDto: ToggleLikeDto) {
    return this.postsService.toggleLike(toggleLikeDto);
  }

  @MessagePattern('posts.addComment')
  addComment(@Payload() createCommentDto: CreateCommentDto) {
    return this.postsService.addComment(createCommentDto);
  }

  @MessagePattern('posts.report')
  report(@Payload() reportPostDto: ReportPostDto) {
    return this.postsService.reportPost(reportPostDto);
  }

  @MessagePattern('posts.findReported')
  findReported(@Payload() payload: FeedQueryPayload) {
    return this.postsService.findReportedPosts(
      payload?.paginationQueryDto ?? ({} as PaginationQueryDto),
      payload?.activeUser as ActiveUserData,
    );
  }

  @MessagePattern('posts.followUser')
  followUser(@Payload() followUserDto: FollowUserDto) {
    return this.postsService.followUser(followUserDto);
  }

  @MessagePattern('posts.unfollowUser')
  unfollowUser(@Payload() followUserDto: FollowUserDto) {
    return this.postsService.unfollowUser(followUserDto);
  }
}
