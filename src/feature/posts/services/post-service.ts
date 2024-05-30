import { Injectable } from '@nestjs/common';
import { BlogDocument } from '../../blogs/domains/domain-blog';
import { BlogRepository } from '../../blogs/repositories/blog-repository';
import { CreatePostDto } from '../dto/create-post-dto';
import { Post, PostDocument } from '../domains/domain-post';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PostRepository } from '../repositories/post-repository';
import { CreatePostInputModel } from '../api/pipes/create-post-input-model';
import { UpdatePostInputModel } from '../api/pipes/update-post-input-model';

@Injectable()
export class PostService {
  constructor(
    protected blogRepository: BlogRepository,
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    protected postRepository: PostRepository,
  ) {}

  async createPost(createPostInputModel: CreatePostInputModel) {
    const { content, shortDescription, title, blogId } = createPostInputModel;

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

  async updatePost(
    postId: string,
    updatePostInputModel: UpdatePostInputModel,
  ): Promise<boolean> {
    return this.postRepository.updatePost(postId, updatePostInputModel);
  }

  async deletePostById(postId: string) {
    return this.postRepository.deletePostById(postId);
  }
}
