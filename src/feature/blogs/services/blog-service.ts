import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Blog, BlogDocument } from '../domains/domain-blog';
import { CreateBlogDto } from '../dto/create-blog-dto';
import { BlogRepository } from '../repositories/blog-repository';
import { Post, PostDocument } from '../../posts/domains/domain-post';
import { CreatePostDto } from '../../posts/dto/create-post-dto';
import { PostRepository } from '../../posts/repositories/post-repository';
import { CreateBlogInputModel } from '../api/pipes/create-blog-input-model';
import { CreatePostForBlogInputModel } from '../api/pipes/create-post-for-blog-input-model';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog.name) private blogModel: Model<BlogDocument>,
    protected blogRepository: BlogRepository,
    protected postRepository: PostRepository,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async createBlog(
    createBlogInputModel: CreateBlogInputModel,
  ): Promise<string> {
    const dtoBlog: CreateBlogDto = new CreateBlogDto(
      createBlogInputModel.name,
      createBlogInputModel.description,
      createBlogInputModel.websiteUrl,
    );

    const newBlog: BlogDocument = new this.blogModel(dtoBlog);

    const blog: BlogDocument = await this.blogRepository.save(newBlog);

    return blog._id.toString();
  }

  async deleteBlogById(blogId: string) {
    return this.blogRepository.deleteBlogById(blogId);
  }

  async updateBlog(
    bologId: string,
    updateBlogInputModel: CreateBlogInputModel,
  ) {
    return this.blogRepository.updateBlog(bologId, updateBlogInputModel);
  }

  async createPostForBlog(
    blogId: string,
    createPostForBlogInputModel: CreatePostForBlogInputModel,
  ) {
    const { title, content, shortDescription } = createPostForBlogInputModel;

    /* нужно получить документ блога из базы чтобы взять от него
 поле blogName*/

    const blog: BlogDocument | null =
      await this.blogRepository.findBlog(blogId);

    if (!blog) return null;

    const blogName = blog.name;

    const dtoPost: CreatePostDto = new CreatePostDto(
      title,
      content,
      shortDescription,
      blogName,
      blogId,
    );
    /* создаю документ post */
    const newPost: PostDocument = new this.postModel(dtoPost);

    const post: PostDocument = await this.postRepository.save(newPost);

    return post._id.toString();
  }
}
