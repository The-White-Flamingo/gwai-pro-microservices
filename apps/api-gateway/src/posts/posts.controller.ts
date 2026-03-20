import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActiveUser, ActiveUserData, Auth, AuthType } from '@app/iam';
import { CreatePostDto, FindPostQueryDto, UpdatePostDto } from '@app/posts';
import { PaginationQueryDto } from '@app/shared';
import { PostsService } from './posts.service';

@ApiTags('posts')
@ApiBearerAuth()
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Auth(AuthType.Bearer)
  @Post()
  create(@Body() dto: Omit<CreatePostDto, 'userId'>, @ActiveUser() user: ActiveUserData) {
    // Inject userId from JWT
    const payload: CreatePostDto = { ...dto, userId: user.sub };
    return this.postsService.create(payload);
  }

  @Auth(AuthType.Bearer)
  @Get()
  findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
    @Query() findPostQueryDto: FindPostQueryDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.findAll(paginationQueryDto, findPostQueryDto, user);
  }

  @Auth(AuthType.Bearer)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postsService.findOne(id);
  }

  @Auth(AuthType.Bearer)
  @Patch(':id')
  update(@Param('id') id: string, @Body() body: Partial<CreatePostDto>) {
    // UpdatePostDto requires id
    const dto: UpdatePostDto = { id, ...body } as UpdatePostDto;
    return this.postsService.update(dto);
  }

  @Auth(AuthType.Bearer)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postsService.remove(id);
  }
}