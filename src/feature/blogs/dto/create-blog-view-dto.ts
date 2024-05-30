import { BlogDocument } from '../domains/domain-blog';
import { ViewBlog } from '../api/types/views';

export class BlogViewDto {
  static getViewModel(blog: BlogDocument): ViewBlog {
    return {
      id: blog._id.toString(),
      name: blog.name,
      description: blog.description,
      websiteUrl: blog.websiteUrl,
      createdAt: blog.createdAt,
      isMembership: blog.isMembership,
    };
  }
}
