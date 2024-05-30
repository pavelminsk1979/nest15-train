import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types } from 'mongoose';
import { Blog, BlogDocument } from '../domains/domain-blog';
import { BlogViewDto } from '../dto/create-blog-view-dto';
import { BlogQueryParams } from '../api/types/models';
import { ViewArrayBlog, ViewBlog } from '../api/types/views';

@Injectable()
export class BlogQueryRepository {
  constructor(@InjectModel(Blog.name) private blogModel: Model<BlogDocument>) {}

  async getBlogs(queryParamsBlog: BlogQueryParams) {
    const { searchNameTerm, sortBy, sortDirection, pageNumber, pageSize } =
      queryParamsBlog;

    const sort = {
      searchNameTerm: searchNameTerm ?? null,

      sortBy: sortBy ?? 'createdAt',

      sortDirection: sortDirection ?? 'desc',

      pageNumber: isNaN(Number(pageNumber)) ? 1 : Number(pageNumber),

      pageSize: isNaN(Number(pageSize)) ? 10 : Number(pageSize),
    };

    const sortDirectionValue = sort.sortDirection === 'asc' ? 1 : -1;

    const filter: { name?: { $regex: string; $options: string } } = {};

    if (sort.searchNameTerm) {
      filter.name = { $regex: sort.searchNameTerm, $options: 'i' };
    }

    const blogs: BlogDocument[] = await this.blogModel
      .find(filter)

      .sort({ [sort.sortBy]: sortDirectionValue })

      .skip((sort.pageNumber - 1) * sort.pageSize)

      .limit(sort.pageSize)

      .exec();

    const totalCount: number = await this.blogModel.countDocuments(filter);

    const pagesCount: number = Math.ceil(totalCount / sort.pageSize);

    const arrayBlogs: ViewBlog[] = blogs.map((blog: BlogDocument) => {
      return BlogViewDto.getViewModel(blog);
    });

    const viewBlogs: ViewArrayBlog = {
      pagesCount,
      page: sort.pageNumber,
      pageSize: sort.pageSize,
      totalCount,
      items: arrayBlogs,
    };
    return viewBlogs;
  }

  async getBlogById(blogId: string) {
    if (!isValidObjectId(blogId)) {
      return null;
    }
    const blog = await this.blogModel.findOne({
      _id: new Types.ObjectId(blogId),
    });

    if (blog) {
      return BlogViewDto.getViewModel(blog);
    } else {
      return null;
    }
  }
}
