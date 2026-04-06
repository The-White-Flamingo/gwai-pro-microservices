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

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Post()
  @ApiOperation({
    summary: 'Create a blog post',
    description:
      'Admin-only route. The authenticated admin identity is injected server-side for author tracking.',
  })
  @ApiBody({
    type: CreateBlogDto,
    examples: {
      createDraft: {
        summary: 'Create draft blog post',
        value: {
          title: 'How To Book Better Studio Sessions',
          content: '<p>Long form blog content...</p>',
          image: 'https://cdn.gwaipro.com/blog/studio-session.jpg',
          tags: ['Studio', 'Booking'],
          status: 'draft',
          authorName: 'GwaiPro Editorial',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Blog post created successfully',
    schema: {
      example: {
        id: 'd6a6ba60-1ab4-4307-871d-f9e77bc8e6aa',
        title: 'How To Book Better Studio Sessions',
        status: 'draft',
        image: 'https://cdn.gwaipro.com/blog/studio-session.jpg',
        tags: ['Studio', 'Booking'],
        content: '<p>Long form blog content...</p>',
        authorName: 'GwaiPro Editorial',
        authorRole: 'Admin',
        lastEditedBy: null,
        publishedAt: null,
        createdAt: '2026-03-31T09:00:00.000Z',
        updatedAt: '2026-03-31T09:00:00.000Z',
      },
    },
  })
  create(
    @Body() createBlogDto: CreateBlogDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    createBlogDto.authorId = activeUser.sub;
    createBlogDto.authorRole = activeUser.role;
    return this.blogService.create(createBlogDto);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Patch(':id')
  @ApiOperation({
    summary: 'Update a blog post',
    description:
      'Admin-only route. The authenticated admin email is stored as the last editor.',
  })
  @ApiParam({
    name: 'id',
    example: 'd6a6ba60-1ab4-4307-871d-f9e77bc8e6aa',
  })
  @ApiBody({
    type: UpdateBlogDto,
    examples: {
      publishUpdate: {
        summary: 'Update blog content',
        value: {
          title: 'How To Book Better Studio Sessions',
          content: '<p>Updated blog content...</p>',
          tags: ['Studio', 'Booking', 'Productivity'],
          status: 'published',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post updated successfully',
    schema: {
      example: {
        id: 'd6a6ba60-1ab4-4307-871d-f9e77bc8e6aa',
        title: 'How To Book Better Studio Sessions',
        status: 'published',
        image: 'https://cdn.gwaipro.com/blog/studio-session.jpg',
        tags: ['Studio', 'Booking', 'Productivity'],
        content: '<p>Updated blog content...</p>',
        authorName: 'GwaiPro Editorial',
        authorRole: 'Admin',
        lastEditedBy: 'admin@gwaipro.com',
        publishedAt: '2026-03-31T09:30:00.000Z',
        createdAt: '2026-03-31T09:00:00.000Z',
        updatedAt: '2026-03-31T09:30:00.000Z',
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
    @ActiveUser() activeUser: ActiveUserData,
  ) {
    updateBlogDto.lastEditedBy = activeUser.email;
    return this.blogService.update(id, updateBlogDto);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Patch(':id/publish')
  @ApiOperation({
    summary: 'Publish a blog post',
    description: 'Admin-only route that publishes a draft blog post.',
  })
  @ApiParam({
    name: 'id',
    example: 'd6a6ba60-1ab4-4307-871d-f9e77bc8e6aa',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post published successfully',
    schema: {
      example: {
        id: 'd6a6ba60-1ab4-4307-871d-f9e77bc8e6aa',
        status: 'published',
        lastEditedBy: 'admin@gwaipro.com',
        publishedAt: '2026-03-31T09:30:00.000Z',
      },
    },
  })
  publish(@Param('id') id: string, @ActiveUser() activeUser: ActiveUserData) {
    return this.blogService.publish(id, activeUser.email);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Patch(':id/unpublish')
  @ApiOperation({
    summary: 'Unpublish a blog post',
    description: 'Admin-only route that moves a published post back to draft.',
  })
  @ApiParam({
    name: 'id',
    example: 'd6a6ba60-1ab4-4307-871d-f9e77bc8e6aa',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post unpublished successfully',
    schema: {
      example: {
        id: 'd6a6ba60-1ab4-4307-871d-f9e77bc8e6aa',
        status: 'draft',
        lastEditedBy: 'admin@gwaipro.com',
        publishedAt: null,
      },
    },
  })
  unpublish(@Param('id') id: string, @ActiveUser() activeUser: ActiveUserData) {
    return this.blogService.unpublish(id, activeUser.email);
  }

  @ApiBearerAuth()
  @Roles(Role.Admin)
  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a blog post',
    description: 'Admin-only route that permanently deletes a blog post.',
  })
  @ApiParam({
    name: 'id',
    example: 'd6a6ba60-1ab4-4307-871d-f9e77bc8e6aa',
  })
  @ApiResponse({
    status: 200,
    description: 'Blog post deleted successfully',
    schema: {
      example: {
        success: true,
        message: 'Blog post deleted successfully.',
      },
    },
  })
  remove(@Param('id') id: string) {
    return this.blogService.remove(id);
  }
}
