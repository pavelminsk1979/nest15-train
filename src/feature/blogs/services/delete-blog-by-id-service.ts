import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../repositories/blog-repository';

@Injectable()
export class DeleteBlogByIdService {
  constructor(protected blogRepository: BlogRepository) {}

  async execute(blogId: string) {
    return this.blogRepository.deleteBlogById(blogId);
  }
}
