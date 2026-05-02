import {
  CreateCommentDto,
  CreatePostDto,
  FindPostQueryDto,
  FollowUserDto,
  ReportPostDto,
  ToggleLikeDto,
  UpdatePostDto,
} from '@app/posts';
import { ActiveUserData } from '@app/iam';
import { USERS_SERVICE, PaginationQueryDto } from '@app/shared';
import { Role } from '@app/users';
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { InjectRepository } from '@nestjs/typeorm';
import { lastValueFrom, timeout } from 'rxjs';
import { In, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Follow } from './entities/follow.entity';
import { Like } from './entities/like.entity';
import { FeedMediaKind, FeedPostType, Post } from './entities/post.entity';
import { Report } from './entities/report.entity';

const USERS_RPC_TIMEOUT_MS = 10000;

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postsRepository: Repository<Post>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
    @InjectRepository(Like)
    private readonly likesRepository: Repository<Like>,
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
    @InjectRepository(Report)
    private readonly reportsRepository: Repository<Report>,
    @Inject(USERS_SERVICE) private readonly usersClient: ClientProxy,
  ) {}

  async create(createPostDto: CreatePostDto) {
    try {
      this.ensureCanPublish(createPostDto.userRole);

      const caption = this.normalizeText(createPostDto.caption);
      const mediaUrls = this.normalizeMediaUrls(createPostDto.mediaUrls);
      this.ensurePostHasContent(caption, mediaUrls);
      this.ensureValidMediaPayload(createPostDto.mediaKind, mediaUrls);

      const post = this.postsRepository.create({
        userId: createPostDto.userId,
        caption,
        mediaUrls,
        mediaKind: mediaUrls ? (createPostDto.mediaKind as FeedMediaKind) : null,
        type: this.resolvePostType(caption, mediaUrls),
        likesCount: 0,
        commentsCount: 0,
      });

      const savedPost = await this.postsRepository.save(post);

      return {
        status: true,
        message: 'Post created successfully',
        data: this.toPostSummary(savedPost, {
          likedByCurrentUser: false,
          isOwner: true,
        }),
      };
    } catch (error) {
      this.throwServiceError(error);
    }
  }

  async findAll(
    paginationQueryDto: PaginationQueryDto,
    findPostQueryDto: FindPostQueryDto,
    activeUser: ActiveUserData,
  ) {
    try {
      const qb = this.postsRepository
        .createQueryBuilder('post')
        .orderBy('post.createdAt', 'DESC');

      this.applyFeedFilters(qb, findPostQueryDto);

      const { items, total, limit, offset } = await this.paginatePosts(
        qb,
        paginationQueryDto,
      );

      return {
        status: true,
        message: 'General feed retrieved successfully',
        data: {
          items: await this.enrichPosts(items, activeUser.sub),
          total,
          limit,
          offset,
        },
      };
    } catch (error) {
      this.throwServiceError(error);
    }
  }

  async findFollowingFeed(
    paginationQueryDto: PaginationQueryDto,
    activeUser: ActiveUserData,
  ) {
    try {
      const followingIds = (
        await this.followsRepository.find({
          where: { followerId: activeUser.sub },
          select: ['followingId'],
        })
      ).map((follow) => follow.followingId);

      if (followingIds.length === 0) {
        return {
          status: true,
          message: 'Following feed retrieved successfully',
          data: {
            items: [],
            total: 0,
            limit: this.resolveLimit(paginationQueryDto.limit),
            offset: this.resolveOffset(paginationQueryDto.offset),
          },
        };
      }

      const qb = this.postsRepository
        .createQueryBuilder('post')
        .where('post.userId IN (:...followingIds)', { followingIds })
        .orderBy('post.createdAt', 'DESC');

      const { items, total, limit, offset } = await this.paginatePosts(
        qb,
        paginationQueryDto,
      );

      return {
        status: true,
        message: 'Following feed retrieved successfully',
        data: {
          items: await this.enrichPosts(items, activeUser.sub),
          total,
          limit,
          offset,
        },
      };
    } catch (error) {
      this.throwServiceError(error);
    }
  }

  async findOne(id: string, activeUser?: ActiveUserData) {
    try {
      const post = await this.findPostOrFail(id);
      const [likedByCurrentUser, comments] = await Promise.all([
        activeUser
          ? this.hasUserLikedPost(id, activeUser.sub)
          : Promise.resolve(false),
        this.commentsRepository.find({
          where: { feedId: id },
          order: { createdAt: 'ASC' },
        }),
      ]);

      return {
        status: true,
        message: 'Post retrieved successfully',
        data: {
          ...this.toPostSummary(post, {
            likedByCurrentUser,
            isOwner: activeUser?.sub === post.userId,
          }),
          comments: this.buildCommentTree(comments),
        },
      };
    } catch (error) {
      this.throwServiceError(error);
    }
  }

  async update(updatePostDto: UpdatePostDto) {
    try {
      this.ensureCanPublish(updatePostDto.userRole);

      const post = await this.findOwnedPostOrFail(
        updatePostDto.id,
        updatePostDto.userId,
      );

      const nextCaption =
        updatePostDto.caption !== undefined
          ? this.normalizeText(updatePostDto.caption)
          : post.caption ?? null;
      const nextMediaUrls =
        updatePostDto.mediaUrls !== undefined
          ? this.normalizeMediaUrls(updatePostDto.mediaUrls)
          : post.mediaUrls ?? null;
      const nextMediaKind =
        updatePostDto.mediaUrls !== undefined
          ? nextMediaUrls
            ? (updatePostDto.mediaKind as FeedMediaKind | undefined) ?? post.mediaKind ?? null
            : null
          : post.mediaKind ?? null;

      this.ensurePostHasContent(nextCaption, nextMediaUrls);
      this.ensureValidMediaPayload(nextMediaKind, nextMediaUrls);

      post.caption = nextCaption;
      post.mediaUrls = nextMediaUrls;
      post.mediaKind = nextMediaUrls ? nextMediaKind : null;
      post.type = this.resolvePostType(nextCaption, nextMediaUrls);

      const updatedPost = await this.postsRepository.save(post);

      return {
        status: true,
        message: 'Post updated successfully',
        data: this.toPostSummary(updatedPost, {
          likedByCurrentUser: await this.hasUserLikedPost(
            updatedPost.id,
            updatePostDto.userId,
          ),
          isOwner: true,
        }),
      };
    } catch (error) {
      this.throwServiceError(error);
    }
  }

  async remove(id: string, activeUser: ActiveUserData) {
    try {
      await this.findOwnedPostOrFail(id, activeUser.sub);
      await this.postsRepository.delete({ id });

      return {
        status: true,
        message: 'Post deleted successfully',
      };
    } catch (error) {
      this.throwServiceError(error);
    }
  }

  async toggleLike(toggleLikeDto: ToggleLikeDto) {
    try {
      const post = await this.findPostOrFail(toggleLikeDto.postId);
      const existingLike = await this.likesRepository.findOneBy({
        feedId: toggleLikeDto.postId,
        userId: toggleLikeDto.userId,
      });

      let liked: boolean;
      if (existingLike) {
        await this.likesRepository.delete({ id: existingLike.id });
        post.likesCount = Math.max((post.likesCount ?? 0) - 1, 0);
        liked = false;
      } else {
        await this.likesRepository.save(
          this.likesRepository.create({
            feedId: toggleLikeDto.postId,
            userId: toggleLikeDto.userId,
          }),
        );
        post.likesCount = (post.likesCount ?? 0) + 1;
        liked = true;
      }

      await this.postsRepository.save(post);

      return {
        status: true,
        message: liked ? 'Post liked successfully' : 'Post unliked successfully',
        data: {
          postId: post.id,
          liked,
          likesCount: post.likesCount,
        },
      };
    } catch (error) {
      this.throwServiceError(error);
    }
  }

  async addComment(createCommentDto: CreateCommentDto) {
    try {
      const post = await this.findPostOrFail(createCommentDto.postId);
      const parentId = createCommentDto.parentId ?? null;

      if (parentId) {
        const parentComment = await this.commentsRepository.findOneBy({
          id: parentId,
          feedId: createCommentDto.postId,
        });

        if (!parentComment) {
          throw new NotFoundException('Parent comment not found');
        }
      }

      const comment = this.commentsRepository.create({
        feedId: createCommentDto.postId,
        userId: createCommentDto.userId,
        parentId,
        body: createCommentDto.body.trim(),
      });

      const savedComment = await this.commentsRepository.save(comment);
      post.commentsCount = (post.commentsCount ?? 0) + 1;
      await this.postsRepository.save(post);

      return {
        status: true,
        message: parentId
          ? 'Reply added successfully'
          : 'Comment added successfully',
        data: this.toCommentNode(savedComment),
      };
    } catch (error) {
      this.throwServiceError(error);
    }
  }

  async reportPost(reportPostDto: ReportPostDto) {
    try {
      await this.findPostOrFail(reportPostDto.postId);

      const existingReport = await this.reportsRepository.findOneBy({
        feedId: reportPostDto.postId,
        userId: reportPostDto.userId,
      });

      if (existingReport) {
        throw new ConflictException('You have already reported this post');
      }

      await this.reportsRepository.save(
        this.reportsRepository.create({
          feedId: reportPostDto.postId,
          userId: reportPostDto.userId,
          reason: this.normalizeText(reportPostDto.reason),
        }),
      );

      return {
        status: true,
        message: 'Post reported successfully',
        data: {
          postId: reportPostDto.postId,
          reported: true,
        },
      };
    } catch (error) {
      this.throwServiceError(error);
    }
  }

  async findReportedPosts(
    paginationQueryDto: PaginationQueryDto,
    activeUser?: ActiveUserData,
  ) {
    try {
      const limit = this.resolveLimit(paginationQueryDto.limit);
      const offset = this.resolveOffset(paginationQueryDto.offset);

      const [reports, total] = await this.reportsRepository
        .createQueryBuilder('report')
        .leftJoinAndSelect('report.post', 'post')
        .orderBy('report.createdAt', 'DESC')
        .skip(offset)
        .take(limit)
        .getManyAndCount();

      return {
        status: true,
        message: 'Reported posts retrieved successfully',
        data: {
          items: await this.toReportedPostItems(reports, activeUser?.sub),
          total,
          limit,
          offset,
        },
      };
    } catch (error) {
      this.throwServiceError(error);
    }
  }

  async followUser(followUserDto: FollowUserDto) {
    try {
      if (followUserDto.followerId === followUserDto.followingId) {
        throw new BadRequestException('You cannot follow yourself');
      }

      const targetUser = await this.findUserById(followUserDto.followingId);
      if (![Role.Musician, Role.Studio].includes(targetUser.role as Role)) {
        throw new BadRequestException('Only musicians and studios can be followed');
      }

      const existingFollow = await this.followsRepository.findOneBy({
        followerId: followUserDto.followerId,
        followingId: followUserDto.followingId,
      });

      if (existingFollow) {
        return {
          status: true,
          message: 'Already following user',
          data: {
            following: true,
            followingId: followUserDto.followingId,
          },
        };
      }

      await this.followsRepository.save(
        this.followsRepository.create({
          followerId: followUserDto.followerId,
          followingId: followUserDto.followingId,
        }),
      );

      return {
        status: true,
        message: 'User followed successfully',
        data: {
          following: true,
          followingId: followUserDto.followingId,
        },
      };
    } catch (error) {
      this.throwServiceError(error);
    }
  }

  async unfollowUser(followUserDto: FollowUserDto) {
    try {
      const existingFollow = await this.followsRepository.findOneBy({
        followerId: followUserDto.followerId,
        followingId: followUserDto.followingId,
      });

      if (!existingFollow) {
        return {
          status: true,
          message: 'User is not currently followed',
          data: {
            following: false,
            followingId: followUserDto.followingId,
          },
        };
      }

      await this.followsRepository.delete({ id: existingFollow.id });

      return {
        status: true,
        message: 'User unfollowed successfully',
        data: {
          following: false,
          followingId: followUserDto.followingId,
        },
      };
    } catch (error) {
      this.throwServiceError(error);
    }
  }

  private ensureCanPublish(role: Role) {
    if (![Role.Musician, Role.Studio].includes(role)) {
      throw new ForbiddenException('Only musicians and studios can create posts');
    }
  }

  private ensurePostHasContent(
    caption?: string | null,
    mediaUrls?: string[] | null,
  ) {
    if (!caption && (!mediaUrls || mediaUrls.length === 0)) {
      throw new BadRequestException(
        'A post must contain a caption, media, or both',
      );
    }
  }

  private resolvePostType(
    caption?: string | null,
    mediaUrls?: string[] | null,
  ): FeedPostType {
    if (caption && mediaUrls && mediaUrls.length > 0) {
      return FeedPostType.MEDIA_WITH_CAPTION;
    }

    if (mediaUrls && mediaUrls.length > 0) {
      return FeedPostType.MEDIA;
    }

    return FeedPostType.TEXT;
  }

  private normalizeText(value?: string | null) {
    const trimmedValue = value?.trim();
    return trimmedValue ? trimmedValue : null;
  }

  private normalizeMediaUrls(values?: string[] | null) {
    if (!values) {
      return null;
    }

    const normalizedValues = values
      .map((value) => value?.trim())
      .filter((value): value is string => Boolean(value));

    return normalizedValues.length > 0 ? normalizedValues : null;
  }

  private ensureValidMediaPayload(
    mediaKind?: FeedMediaKind | 'IMAGE' | 'VIDEO' | null,
    mediaUrls?: string[] | null,
  ) {
    if (!mediaUrls || mediaUrls.length === 0) {
      return;
    }

    if (!mediaKind) {
      throw new BadRequestException('mediaKind is required when media is uploaded');
    }

    if (mediaKind === FeedMediaKind.VIDEO && mediaUrls.length !== 1) {
      throw new BadRequestException('Only one video can be uploaded per post');
    }

    if (mediaKind === FeedMediaKind.IMAGE && mediaUrls.length > 10) {
      throw new BadRequestException('A post can contain up to 10 images');
    }
  }

  private resolveLimit(limit?: number) {
    return limit && limit > 0 ? limit : 20;
  }

  private resolveOffset(offset?: number) {
    return offset && offset >= 0 ? offset : 0;
  }

  private applyFeedFilters(
    qb: ReturnType<Repository<Post>['createQueryBuilder']>,
    findPostQueryDto: FindPostQueryDto,
  ) {
    if (findPostQueryDto.userId) {
      qb.andWhere('post.userId = :userId', {
        userId: findPostQueryDto.userId,
      });
    }

    if (findPostQueryDto.caption) {
      qb.andWhere('LOWER(post.caption) LIKE :caption', {
        caption: `%${findPostQueryDto.caption.toLowerCase()}%`,
      });
    }

    if (findPostQueryDto.type) {
      qb.andWhere('post.type = :type', {
        type: findPostQueryDto.type,
      });
    }
  }

  private async paginatePosts(
    qb: ReturnType<Repository<Post>['createQueryBuilder']>,
    paginationQueryDto: PaginationQueryDto,
  ) {
    const limit = this.resolveLimit(paginationQueryDto.limit);
    const offset = this.resolveOffset(paginationQueryDto.offset);
    const [items, total] = await qb.skip(offset).take(limit).getManyAndCount();

    return { items, total, limit, offset };
  }

  private async enrichPosts(posts: Post[], currentUserId?: string) {
    const postIds = posts.map((post) => post.id);
    const likedPostIds = await this.findLikedPostIds(postIds, currentUserId);

    return posts.map((post) =>
      this.toPostSummary(post, {
        likedByCurrentUser: likedPostIds.has(post.id),
        isOwner: currentUserId === post.userId,
      }),
    );
  }

  private async toReportedPostItems(reports: Report[], currentUserId?: string) {
    const posts = reports
      .map((report) => report.post)
      .filter((post): post is Post => Boolean(post));
    const likedPostIds = await this.findLikedPostIds(
      posts.map((post) => post.id),
      currentUserId,
    );

    return reports.map((report) => ({
      id: report.id,
      postId: report.feedId,
      reportedByUserId: report.userId,
      reason: report.reason ?? null,
      createdAt: report.createdAt,
      post: report.post
        ? this.toPostSummary(report.post, {
            likedByCurrentUser: likedPostIds.has(report.post.id),
            isOwner: currentUserId === report.post.userId,
          })
        : null,
    }));
  }

  private async findLikedPostIds(postIds: string[], currentUserId?: string) {
    if (postIds.length === 0 || !currentUserId) {
      return new Set<string>();
    }

    return new Set(
      (
        await this.likesRepository.find({
          where: {
            feedId: In(postIds),
            userId: currentUserId,
          },
          select: ['feedId'],
        })
      ).map((like) => like.feedId),
    );
  }

  private toPostSummary(
    post: Post,
    options: { likedByCurrentUser: boolean; isOwner: boolean },
  ) {
    return {
      id: post.id,
      userId: post.userId,
      mediaUrl: post.mediaUrls?.[0] ?? null,
      mediaUrls: post.mediaUrls ?? [],
      mediaKind: post.mediaKind ?? null,
      caption: post.caption,
      type: post.type,
      likesCount: post.likesCount,
      commentsCount: post.commentsCount,
      likedByCurrentUser: options.likedByCurrentUser,
      isOwner: options.isOwner,
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };
  }

  private buildCommentTree(comments: Comment[]) {
    const commentMap = new Map<
      string,
      ReturnType<PostsService['toCommentNode']> & { replies: any[] }
    >();

    for (const comment of comments) {
      commentMap.set(comment.id, this.toCommentNode(comment));
    }

    const roots: Array<ReturnType<PostsService['toCommentNode']>> = [];

    for (const comment of comments) {
      const node = commentMap.get(comment.id)!;

      if (comment.parentId && commentMap.has(comment.parentId)) {
        commentMap.get(comment.parentId)!.replies.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  private toCommentNode(comment: Comment) {
    return {
      id: comment.id,
      postId: comment.feedId,
      userId: comment.userId,
      parentId: comment.parentId,
      body: comment.body,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
      replies: [],
    };
  }

  private async hasUserLikedPost(postId: string, userId: string) {
    const existingLike = await this.likesRepository.findOneBy({
      feedId: postId,
      userId,
    });

    return Boolean(existingLike);
  }

  private async findPostOrFail(id: string) {
    const post = await this.postsRepository.findOneBy({ id });
    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return post;
  }

  private async findOwnedPostOrFail(id: string, userId: string) {
    const post = await this.findPostOrFail(id);
    if (post.userId !== userId) {
      throw new ForbiddenException('You can only modify your own posts');
    }

    return post;
  }

  private async findUserById(id: string) {
    try {
      const response = await lastValueFrom(
        this.usersClient
          .send<{ data: { id: string; role: Role } }>('users.findOne', id)
          .pipe(timeout(USERS_RPC_TIMEOUT_MS)),
      );

      if (!response?.data) {
        throw new NotFoundException('User not found');
      }

      return response.data;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new ServiceUnavailableException(
        error?.message ?? 'Unable to validate follow target',
      );
    }
  }

  private throwServiceError(error: any): never {
    if (
      error instanceof BadRequestException ||
      error instanceof NotFoundException ||
      error instanceof ForbiddenException ||
      error instanceof ConflictException ||
      error instanceof ServiceUnavailableException
    ) {
      throw error;
    }

    throw new BadRequestException(error?.message ?? 'Posts service failed');
  }
}
