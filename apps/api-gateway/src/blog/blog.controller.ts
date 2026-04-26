// apps/api-gateway/src/blog/blog.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ActiveUser, ActiveUserData, Auth, AuthType } from '@app/iam';
import { Roles } from '@app/iam'; // reuse your existing decorator
import { Role } from '@app/iam'; // reuse your existing enum
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ─── Public endpoints (no auth required) ──────────────────────────────────

  @Auth(AuthType.None)
  @Get()
  findAll() {
    return this.blogService.findAll(); // published only
  }

  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.blogService.findOne(id);
  }

  // ─── Admin-only endpoints ─────────────────────────────────────────────────

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Get('admin/all')
  findAllAdmin() {
    return this.blogService.findAllAdmin(); // drafts + published
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Post()
  create(
    @Body() createBlogDto: CreateBlogDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    // Inject admin identity from JWT — client never sends this
    createBlogDto.authorId = activeUser.sub;
    createBlogDto.authorRole = activeUser.email;
    return this.blogService.create(createBlogDto);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    return this.blogService.update(id, updateBlogDto);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Patch(':id/publish')
  publish(@Param('id') id: string) {
    return this.blogService.publish(id);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Patch(':id/unpublish')
  unpublish(@Param('id') id: string) {
    return this.blogService.unpublish(id);
  }
}