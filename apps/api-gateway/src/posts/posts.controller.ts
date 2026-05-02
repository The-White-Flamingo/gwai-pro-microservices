import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { ActiveUser, ActiveUserData, Auth, AuthType, Roles } from '@app/iam';
import {
  CreateCommentDto,
  CreatePostDto,
  FindPostQueryDto,
  UpdatePostDto,
} from '@app/posts';
import { PaginationQueryDto } from '@app/shared';
import { Role } from '@app/users';
import { PostsService } from './posts.service';
import { postMediaUploadOptions, buildPostMediaPayload } from './post-media.util';

@ApiTags('posts')
@ApiBearerAuth()
@Auth(AuthType.Bearer)
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @Roles(Role.Musician, Role.Studio)
  @UseInterceptors(FileInterceptor('media', postMediaUploadOptions))
  @ApiOperation({
    summary: 'Create a feed post',
    description:
      'Only musicians and studios can create feed posts. A post can be caption-only, media-only, or media plus caption. Only images for now boss',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        caption: {
          type: 'string',
          example: 'Catption here.',
        },
        media: {
          type: 'string',
          format: 'binary',
        },
      },
    },
    examples: {
      captionOnly: {
        summary: 'Caption only',
        value: {
          caption: 'Live session at 8pm.',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    schema: {
      example: {
        status: true,
        message: 'Post created successfully',
        data: {
          id: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
          userId: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
          mediaUrl: '/uploads/post-media/5c26968d-91dd-438e-b77b-5f8c1d9fae9d.png',
          caption: 'CApption here.',
          type: 'MEDIA_WITH_CAPTION',
          likesCount: 0,
          commentsCount: 0,
          likedByCurrentUser: false,
          isOwner: true,
          createdAt: '2026-04-27T18:10:00.000Z',
          updatedAt: '2026-04-27T18:10:00.000Z',
        },
      },
    },
  })
  create(
    @Body() body: Omit<CreatePostDto, 'userId' | 'userRole' | 'mediaUrls' | 'mediaKind'>,
    @UploadedFile() file: Express.Multer.File,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.create({
      ...body,
      ...buildPostMediaPayload(file ? [file] : undefined),
      userId: user.sub,
      userRole: user.role,
    });
  }

  @Get()
  @ApiOperation({
    summary: 'Get the general feed',
    description:
      'Returns all posts, pagination and optional filtering by author, caption, and post type.',
  })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiQuery({ name: 'userId', required: false, example: 'e10f6b2c-3d58-4c87-84fd-beff956831c9' })
  @ApiQuery({ name: 'caption', required: false, example: 'studio' })
  @ApiQuery({ name: 'type', required: false, example: 'MEDIA_WITH_CAPTION' })
  @ApiResponse({
    status: 200,
    description: 'General feed retrieved successfully',
    schema: {
      example: {
        status: true,
        message: 'General feed retrieved successfully',
        data: {
          items: [
            {
              id: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
              userId: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
              mediaUrl: '/uploads/post-media/5c26968d-91dd-438e-b77b-5f8c1d9fae9d.png',
              caption: 'New studio setup ready for tonight.',
              type: 'MEDIA_WITH_CAPTION',
              likesCount: 6,
              commentsCount: 3,
              likedByCurrentUser: true,
              isOwner: false,
              createdAt: '2026-04-27T18:10:00.000Z',
              updatedAt: '2026-04-27T18:10:00.000Z',
            },
          ],
          total: 1,
          limit: 20,
          offset: 0,
        },
      },
    },
  })
  findAll(
    @Query() paginationQueryDto: PaginationQueryDto,
    @Query() findPostQueryDto: FindPostQueryDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.findAll(paginationQueryDto, findPostQueryDto, user);
  }

  @Get('following-feed')
  @ApiOperation({
    summary: 'Get the following feed',
    description:
      'Returns posts created by users the current user follows.',
  })
  @ApiQuery({ name: 'limit', required: false, example: 20 })
  @ApiQuery({ name: 'offset', required: false, example: 0 })
  @ApiResponse({
    status: 200,
    description: 'Following feed retrieved successfully',
    schema: {
      example: {
        status: true,
        message: 'Following feed retrieved successfully',
        data: {
          items: [
            {
              id: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
              userId: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
              mediaUrl: '/uploads/post-media/5c26968d-91dd-438e-b77b-5f8c1d9fae9d.png',
              caption: 'Caption here.',
              type: 'MEDIA_WITH_CAPTION',
              likesCount: 6,
              commentsCount: 3,
              likedByCurrentUser: false,
              isOwner: false,
              createdAt: '2026-04-27T18:10:00.000Z',
              updatedAt: '2026-04-27T18:10:00.000Z',
            },
          ],
          total: 1,
          limit: 20,
          offset: 0,
        },
      },
    },
  })
  findFollowingFeed(
    @Query() paginationQueryDto: PaginationQueryDto,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.findFollowingFeed(paginationQueryDto, user);
  }

  @Post('follows/:followingId')
  @ApiOperation({
    summary: 'Follow a user',
    description:
      'Allows any authenticated user to follow a client, musician, or studio.',
  })
  @ApiParam({
    name: 'followingId',
    example: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
  })
  @ApiResponse({
    status: 201,
    description: 'User followed successfully',
    schema: {
      example: {
        status: true,
        message: 'User followed successfully',
        data: {
          following: true,
          followingId: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
        },
      },
    },
  })
  followUser(
    @Param('followingId') followingId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.followUser(followingId, user);
  }

  @Delete('follows/:followingId')
  @ApiOperation({
    summary: 'Unfollow a user',
    description: 'Stops following a previously followed user.',
  })
  @ApiParam({
    name: 'followingId',
    example: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
  })
  @ApiResponse({
    status: 200,
    description: 'User unfollowed successfully',
    schema: {
      example: {
        status: true,
        message: 'User unfollowed successfully',
        data: {
          following: false,
          followingId: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
        },
      },
    },
  })
  unfollowUser(
    @Param('followingId') followingId: string,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.unfollowUser(followingId, user);
  }

  @Post(':id/likes/toggle')
  @ApiOperation({
    summary: 'Like or unlike a post',
    description:
      'Toggles the authenticated user like state for the specified post.',
  })
  @ApiParam({
    name: 'id',
    example: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
  })
  @ApiResponse({
    status: 201,
    description: 'Like state toggled successfully',
    schema: {
      example: {
        status: true,
        message: 'Post liked successfully',
        data: {
          postId: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
          liked: true,
          likesCount: 7,
        },
      },
    },
  })
  toggleLike(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    return this.postsService.toggleLike(id, user);
  }

  @Post(':id/comments')
  @ApiOperation({
    summary: 'Comment on a post or reply to a comment',
    description:
      'Adds a top-level comment or, if parentId is provided, creates a reply in the comment thread.',
  })
  @ApiParam({
    name: 'id',
    example: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
  })
  @ApiBody({
    schema: {
      type: 'object',
      required: ['body'],
      properties: {
        body: {
          type: 'string',
          example: 'This mix sounds clean.',
        },
        parentId: {
          type: 'string',
          format: 'uuid',
          example: '1f22988a-7d67-4f81-9932-7322adcf9cb0',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Comment added successfully',
    schema: {
      example: {
        status: true,
        message: 'Comment added successfully',
        data: {
          id: '814820fb-0dd1-44b6-9f21-8bbd943c8f6a',
          postId: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
          userId: '29b23bd0-d325-41aa-ab61-d12e3642f288',
          parentId: null,
          body: 'This mix sounds clean.',
          createdAt: '2026-04-27T18:30:00.000Z',
          updatedAt: '2026-04-27T18:30:00.000Z',
          replies: [],
        },
      },
    },
  })
  addComment(
    @Param('id') id: string,
    @Body() body: Omit<CreateCommentDto, 'postId' | 'userId'>,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.addComment(id, body, user);
  }

  // @Post(':id/report')
  // @ApiOperation({
  //   summary: 'Report a post',
  //   description: 'Reports a post for moderation review.',
  // })
  // @ApiParam({
  //   name: 'id',
  //   example: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
  // })
  // @ApiBody({
  //   schema: {
  //     type: 'object',
  //     properties: {
  //       reason: {
  //         type: 'string',
  //         example: 'Copyrighted content',
  //       },
  //     },
  //   },
  // })
  // @ApiResponse({
  //   status: 201,
  //   description: 'Post reported successfully',
  //   schema: {
  //     example: {
  //       status: true,
  //       message: 'Post reported successfully',
  //       data: {
  //         postId: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
  //         reported: true,
  //       },
  //     },
  //   },
  // })
  // reportPost(
  //   @Param('id') id: string,
  //   @Body() body: { reason?: string },
  //   @ActiveUser() user: ActiveUserData,
  // ) {
  //   return this.postsService.reportPost(id, body, user);
  // }

  // @Get(':id/download')
  // @ApiOperation({
  //   summary: 'Download a watermarked post image',
  //   description:
  //     'Downloads the post media with a GwaiPro watermark applied. Caption-only posts cannot be downloaded.',
  // })
  // @ApiParam({
  //   name: 'id',
  //   example: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
  // })
  // @ApiResponse({
  //   status: 200,
  //   description: 'Watermarked media download',
  // })
  // async download(
  //   @Param('id') id: string,
  //   @ActiveUser() user: ActiveUserData,
  //   @Res() response: Response,
  // ) {
  //   const download = await this.postsService.downloadPostMedia(id, user);
  //   response.setHeader('Content-Type', download.contentType);
  //   response.setHeader(
  //     'Content-Disposition',
  //     `attachment; filename="${download.fileName}"`,
  //   );
  //   response.send(download.buffer);
  // }

  @Get(':id')
  @ApiOperation({
    summary: 'Get one post with its comment thread',
    description:
      'Returns a single post and a nested comment thread including replies.',
  })
  @ApiParam({
    name: 'id',
    example: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
  })
  @ApiResponse({
    status: 200,
    description: 'Post retrieved successfully',
    schema: {
      example: {
        status: true,
        message: 'Post retrieved successfully',
        data: {
          id: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
          userId: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
          mediaUrl: '/uploads/post-media/5c26968d-91dd-438e-b77b-5f8c1d9fae9d.png',
          caption: 'Caption details here.',
          type: 'MEDIA_WITH_CAPTION',
          likesCount: 6,
          commentsCount: 1,
          likedByCurrentUser: true,
          isOwner: false,
          createdAt: '2026-04-27T18:10:00.000Z',
          updatedAt: '2026-04-27T18:10:00.000Z',
          comments: [
            {
              id: '814820fb-0dd1-44b6-9f21-8bbd943c8f6a',
              postId: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
              userId: '29b23bd0-d325-41aa-ab61-d12e3642f288',
              parentId: null,
              body: 'First level comments here.',
              createdAt: '2026-04-27T18:30:00.000Z',
              updatedAt: '2026-04-27T18:30:00.000Z',
              replies: [],
            },
          ],
        },
      },
    },
  })
  findOne(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    return this.postsService.findOne(id, user);
  }

  @Patch(':id')
  @Roles(Role.Musician, Role.Studio)
  @UseInterceptors(FileInterceptor('media', postMediaUploadOptions))
  @ApiOperation({
    summary: 'Update your post',
    description:
      'Allows the post owner to change caption text and optionally replace the uploaded image.',
  })
  @ApiConsumes('multipart/form-data')
  @ApiParam({
    name: 'id',
    example: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        caption: {
          type: 'string',
          example: 'Updated caption for tonight.',
        },
        media: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Post updated successfully',
    schema: {
      example: {
        status: true,
        message: 'Post updated successfully',
        data: {
          id: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
          userId: 'e10f6b2c-3d58-4c87-84fd-beff956831c9',
          mediaUrl: '/uploads/post-media/5c26968d-91dd-438e-b77b-5f8c1d9fae9d.png',
          caption: 'Updated caption for tonight.',
          type: 'MEDIA_WITH_CAPTION',
          likesCount: 6,
          commentsCount: 3,
          likedByCurrentUser: false,
          isOwner: true,
          createdAt: '2026-04-27T18:10:00.000Z',
          updatedAt: '2026-04-27T18:40:00.000Z',
        },
      },
    },
  })
  update(
    @Param('id') id: string,
    @Body() body: Partial<Omit<UpdatePostDto, 'id' | 'userId' | 'userRole' | 'mediaUrls' | 'mediaKind'>>,
    @UploadedFile() file: Express.Multer.File,
    @ActiveUser() user: ActiveUserData,
  ) {
    return this.postsService.update({
      ...body,
      id,
      ...buildPostMediaPayload(file ? [file] : undefined),
      userId: user.sub,
      userRole: user.role,
    });
  }

  @Delete(':id')
  @Roles(Role.Musician, Role.Studio)
  @ApiOperation({
    summary: 'Delete your post',
    description:
      'Deletes the specified post only if it belongs to the authenticated user.',
  })
  @ApiParam({
    name: 'id',
    example: '93ad17a6-fd32-4e85-a22b-1d0f88b28b18',
  })
  @ApiResponse({
    status: 200,
    description: 'Post deleted successfully',
    schema: {
      example: {
        status: true,
        message: 'Post deleted successfully',
      },
    },
  })
  remove(@Param('id') id: string, @ActiveUser() user: ActiveUserData) {
    return this.postsService.remove(id, user);
  }
}
