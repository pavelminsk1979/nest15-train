import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { QueryParamsPost } from './types/models';
import { PostService } from '../services/post-service';
import { PostQueryRepository } from '../repositories/post-query-repository';
import { ViewArrayPosts, ViewPost } from './types/views';
import { QueryCommentsForPost } from '../../comments/types/models';
import { CommentQueryRepository } from '../../comments/reposetories/comment-query-repository';
import { ViewArrayComments } from '../../comments/types/views';
import { CreatePostInputModel } from './pipes/create-post-input-model';
import { UpdatePostInputModel } from './pipes/update-post-input-model';
import { AuthGuard } from '../../../common/guard/auth-guard';
import { CreateCommentForPostInputModel } from './pipes/create-coment-for-post-input-model';
import { AuthTokenGuard } from '../../../common/guard/auth-token-guard';

@Controller('posts')
export class PostsController {
  constructor(
    protected postService: PostService,
    protected postQueryRepository: PostQueryRepository,
    protected commentQueryRepository: CommentQueryRepository,
  ) {}

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createPost(
    @Body() createPostInputModel: CreatePostInputModel,
  ): Promise<ViewPost | null> {
    /* создать новый пост  и вернуть данные этого поста и также
    внутри структуру данных(снулевыми значениями)  о лайках  к этому посту*/

    const postId: string | null =
      await this.postService.createPost(createPostInputModel);

    if (!postId) {
      throw new NotFoundException(
        'Cannot create post because blog does not exist-:method-post,url-posts',
      );
    }

    const post: ViewPost | null =
      await this.postQueryRepository.getPostById(postId);

    if (post) {
      return post;
    } else {
      throw new NotFoundException('Cannot create post- :method-post,url-posts');
    }
  }

  @Get()
  async getPosts(
    @Query() queryParamsPost: QueryParamsPost,
  ): Promise<ViewArrayPosts> {
    const posts: ViewArrayPosts | null =
      await this.postQueryRepository.getPosts(queryParamsPost);

    if (posts) {
      return posts;
    } else {
      throw new NotFoundException(
        ' post  is not exists  ' + ':method-get,url -posts',
      );
    }
  }

  @Get(':id')
  async getPostById(@Param('id') postId: string): Promise<ViewPost | null> {
    const post: ViewPost | null =
      await this.postQueryRepository.getPostById(postId);

    if (post) {
      return post;
    } else {
      throw new NotFoundException('post not found:method-get,url /posts/id');
    }
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(
    @Param('id') postId: string,
    @Body() updatePostInputModel: UpdatePostInputModel,
  ) {
    const isUpdatePost: boolean = await this.postService.updatePost(
      postId,
      updatePostInputModel,
    );

    if (isUpdatePost) {
      return;
    } else {
      throw new NotFoundException(
        'post not update:andpoint-put ,url /posts/id',
      );
    }
  }

  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deletePostById(@Param('id') postId: string) {
    const isDeletePostById = await this.postService.deletePostById(postId);

    if (isDeletePostById) {
      return;
    } else {
      throw new NotFoundException(
        'post not found:andpoint-delete,url /post/id',
      );
    }
  }

  @Get(':postId/comments')
  async getCommentsForPost(
    @Param('postId') postId: string,
    @Query() queryCommentsForPost: QueryCommentsForPost,
  ): Promise<ViewArrayComments> {
    const comments: ViewArrayComments | null =
      await this.commentQueryRepository.getComments(
        postId,
        queryCommentsForPost,
      );

    if (comments) {
      return comments;
    } else {
      throw new NotFoundException(
        'post or comments  is not exists  ' +
          ':method-get,url -posts/postId/comments',
      );
    }
  }

  @UseGuards(AuthTokenGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post(':postId/comments')
  async createCommentForPost(
    @Param('postId') postId: string,
    @Body() createCommentForPostInputModel: CreateCommentForPostInputModel,
  ) {
    return { postId, createCommentForPostInputModel };
  }
}
