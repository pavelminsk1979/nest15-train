import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../repositories/blog-repository';
import { CreateBlogInputModel } from '../api/pipes/create-blog-input-model';

@Injectable()
export class UpdateBlogService {
  constructor(protected blogRepository: BlogRepository) {}

  async execute(bologId: string, updateBlogInputModel: CreateBlogInputModel) {
    return this.blogRepository.updateBlog(bologId, updateBlogInputModel);
  }
}
