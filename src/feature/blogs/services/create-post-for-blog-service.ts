import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { BlogDocument } from '../domains/domain-blog';
import { BlogRepository } from '../repositories/blog-repository';
import { Post, PostDocument } from '../../posts/domains/domain-post';
import { CreatePostDto } from '../../posts/dto/create-post-dto';
import { PostRepository } from '../../posts/repositories/post-repository';
import { CreatePostForBlogInputModel } from '../api/pipes/create-post-for-blog-input-model';
import { CommandHandler } from '@nestjs/cqrs';

export class CreatePostForBlogCommand {
  constructor(
    public blogId: string,
    public createPostForBlogInputModel: CreatePostForBlogInputModel,
  ) {}
}

@CommandHandler(CreatePostForBlogCommand)
@Injectable()
export class CreatePostForBlogService {
  constructor(
    protected blogRepository: BlogRepository,
    protected postRepository: PostRepository,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
  ) {}

  async execute(command: CreatePostForBlogCommand) {
    const { title, content, shortDescription } =
      command.createPostForBlogInputModel;

    /* нужно получить документ блога из базы чтобы взять от него
 поле blogName*/

    const blog: BlogDocument | null = await this.blogRepository.findBlog(
      command.blogId,
    );

    if (!blog) return null;

    const blogName = blog.name;

    const dtoPost: CreatePostDto = new CreatePostDto(
      title,
      content,
      shortDescription,
      blogName,
      command.blogId,
    );
    /* создаю документ post */
    const newPost: PostDocument = new this.postModel(dtoPost);

    const post: PostDocument = await this.postRepository.save(newPost);

    return post._id.toString();
  }
}
