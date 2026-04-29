// apps/api-gateway/src/blog/blog.controller.ts
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
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveUser, ActiveUserData, Auth, AuthType, Roles } from '@app/iam';
import { Role } from '@app/users';
import { BlogService } from './blog.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';
import { PaginateBlogDto } from './dto/paginate-blog.dto';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Auth(AuthType.None)
  @Get()
  @ApiOperation({
    summary: 'List published blog posts',
    description:
      'Returns only published blog posts for public consumption. Content is omitted from the list response.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 9 })
  @ApiResponse({
    status: 200,
    description: 'Published blog posts fetched successfully',
    schema: {
      example: {
        data: [
          {
            id: 'd6a6ba60-1ab4-4307-871d-f9e77bc8e6aa',
            title: 'How To Book Better Studio Sessions',
            status: 'published',
            image: 'https://cdn.gwaipro.com/blog/studio-session.jpg',
            tags: ['Studio', 'Booking'],
            authorName: 'GwaiPro Editorial',
            publishedAt: '2026-03-31T09:30:00.000Z',
          },
        ],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
      },
    },
  })
  findAll(@Query() paginateBlogDto: PaginateBlogDto) {
    return this.blogService.findAll(paginateBlogDto);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Get('admin/all')
  @ApiOperation({
    summary: 'List all blog posts for admins',
    description:
      'Returns drafts and published posts for admins. This route is restricted to users with the Admin role.',
  })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({
    status: 200,
    description: 'All blog posts fetched successfully',
    schema: {
      example: {
        data: [
          {
            id: 'd6a6ba60-1ab4-4307-871d-f9e77bc8e6aa',
            title: 'How To Book Better Studio Sessions',
            status: 'draft',
            image: 'https://cdn.gwaipro.com/blog/studio-session.jpg',
            tags: ['Studio', 'Booking'],
            content: '<p>Long form blog content...</p>',
            authorName: 'GwaiPro Editorial',
            authorRole: 'Admin',
            lastEditedBy: 'admin@gwaipro.com',
            publishedAt: null,
            createdAt: '2026-03-31T09:00:00.000Z',
            updatedAt: '2026-03-31T09:05:00.000Z',
          },
        ],
        totalCount: 1,
        totalPages: 1,
        currentPage: 1,
      },
    },
  })
  findAllAdmin(@Query() paginateBlogDto: PaginateBlogDto) {
    return this.blogService.findAllAdmin(paginateBlogDto);
  }

  @Auth(AuthType.None)
  @Get(':id')
  @ApiOperation({
    summary: 'Fetch one blog post',
    description: 'Returns the full public blog post payload by id.',
  })
  @ApiParam({
    name: 'id',
    example: 'd6a6ba60-1ab4-4307-871d-f9e77bc8e6aa',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post fetched successfully',
    schema: {
      example: {
        id: 'd6a6ba60-1ab4-4307-871d-f9e77bc8e6aa',
        title: 'How To Book Better Studio Sessions',
        status: 'published',
        image: 'https://cdn.gwaipro.com/blog/studio-session.jpg',
        tags: ['Studio', 'Booking'],
        content: '<p>Long form blog content...</p>',
        authorName: 'GwaiPro Editorial',
        authorRole: 'Admin',
        lastEditedBy: 'admin@gwaipro.com',
        publishedAt: '2026-03-31T09:30:00.000Z',
        createdAt: '2026-03-31T09:00:00.000Z',
        updatedAt: '2026-03-31T09:30:00.000Z',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Blog post not found',
    schema: {
      example: {
        message: 'Blog post not found',
        error: 'Not Found',
        statusCode: 404,
      },
    },
  })
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
