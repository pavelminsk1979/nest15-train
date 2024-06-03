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
} from '@nestjs/common';
import { CreateBlogService } from '../services/create-blog-service';
import { BlogQueryRepository } from '../repositories/blog-query-repository';
import { BlogQueryParams, QueryParamsPostForBlog } from './types/models';
import { ViewBlog } from './types/views';
import { PostQueryRepository } from '../../posts/repositories/post-query-repository';
import { ViewArrayPosts, ViewPost } from '../../posts/api/types/views';
import { CreateBlogInputModel } from './pipes/create-blog-input-model';
import { CreatePostForBlogInputModel } from './pipes/create-post-for-blog-input-model';
import { DeleteBlogByIdCommand } from '../services/delete-blog-by-id-service';
import { UpdateBlogService } from '../services/update-blog-service';
import { CreatePostForBlogService } from '../services/create-post-for-blog-service';
import { CommandBus } from '@nestjs/cqrs';

@Controller('blogs')
export class BlogController {
  constructor(
    protected commandBus: CommandBus,
    protected createBlogService: CreateBlogService,
    protected updateBlogService: UpdateBlogService,
    protected createPostForBlogService: CreatePostForBlogService,
    protected blogQueryRepository: BlogQueryRepository,
    protected postQueryRepository: PostQueryRepository,
  ) {}

  @HttpCode(HttpStatus.CREATED)
  @Post()
  async createBlog(
    @Body() createBlogInputModel: CreateBlogInputModel,
  ): Promise<ViewBlog> {
    const id = await this.createBlogService.execute(createBlogInputModel);

    const blog = await this.blogQueryRepository.getBlogById(id);

    if (blog) {
      return blog;
    } else {
      throw new NotFoundException('blog not found:andpoint-post,url /blogs');
    }
  }

  @Get()
  async getBlogs(@Query() queryParamsBlog: BlogQueryParams) {
    const blogs = await this.blogQueryRepository.getBlogs(queryParamsBlog);
    return blogs;
  }

  @Get(':id')
  async getBlogById(@Param('id') bologId: string) {
    const blog = await this.blogQueryRepository.getBlogById(bologId);

    if (blog) {
      return blog;
    } else {
      throw new NotFoundException('blog not found:andpoint-get,url /blogs/id');
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async deleteBlogById(@Param('id') blogId: string) {
    const isDeleteBlogById = await this.commandBus.execute(
      new DeleteBlogByIdCommand(blogId),
    );

    if (isDeleteBlogById) {
      return;
    } else {
      throw new NotFoundException(
        'blog not found:andpoint-delete,url /blogs/id',
      );
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Put(':id')
  async updateBlog(
    @Param('id') bologId: string,
    @Body() updateBlogInputModel: CreateBlogInputModel,
  ) {
    const isUpdateBlog = await this.updateBlogService.execute(
      bologId,
      updateBlogInputModel,
    );

    if (isUpdateBlog) {
      return;
    } else {
      throw new NotFoundException(
        'blog not update:andpoint-put ,url /blogs/id',
      );
    }
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':blogId/posts')
  async createPostFortBlog(
    @Param('blogId') blogId: string,
    @Body() createPostForBlogInputModel: CreatePostForBlogInputModel,
  ): Promise<ViewPost | null> {
    const postId: string | null = await this.createPostForBlogService.execute(
      blogId,
      createPostForBlogInputModel,
    );

    if (!postId) {
      throw new NotFoundException(
        'Cannot create post because blog does not exist- ' +
          ':method-post,url -blogs/:blogId /post',
      );
    }

    const post: ViewPost | null =
      await this.postQueryRepository.getPostById(postId);

    if (post) {
      return post;
    } else {
      throw new NotFoundException(
        'Cannot create post- ' + ':method-post,url -blogs/:blogId /post',
      );
    }
  }

  @Get(':blogId/posts')
  async getPostsForBlog(
    @Param('blogId') blogId: string,
    @Query() queryParamsPostForBlog: QueryParamsPostForBlog,
  ): Promise<ViewArrayPosts> {
    const posts = await this.postQueryRepository.getPostsByCorrectBlogId(
      blogId,
      queryParamsPostForBlog,
    );

    if (posts) {
      return posts;
    } else {
      throw new NotFoundException(
        'blog or post  is not exists  ' +
          ':method-get,url -blogs/:blogId /posts',
      );
    }
  }
}
