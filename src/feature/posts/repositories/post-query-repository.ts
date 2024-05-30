import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domains/domain-post';
import { PostViewDto } from '../dto/create-post-view-dto';
import { ViewArrayPosts, ViewPost } from '../api/types/views';
import { QueryParamsPostForBlog } from '../../blogs/api/types/models';

@Injectable()
export class PostQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async getPosts(queryParamsPostForBlog: QueryParamsPostForBlog) {
    const { sortBy, sortDirection, pageNumber, pageSize } =
      queryParamsPostForBlog;

    const sort = {
      sortBy: sortBy ?? 'createdAt',

      sortDirection: sortDirection ?? 'desc',

      pageNumber: isNaN(Number(pageNumber)) ? 1 : Number(pageNumber),

      pageSize: isNaN(Number(pageSize)) ? 10 : Number(pageSize),
    };

    const sortDirectionValue = sort.sortDirection === 'asc' ? 1 : -1;

    const posts: PostDocument[] = await this.postModel
      .find({})

      .sort({ [sort.sortBy]: sortDirectionValue })

      .skip((sort.pageNumber - 1) * sort.pageSize)

      .limit(sort.pageSize)

      .exec();

    const totalCount: number = await this.postModel.countDocuments({});

    const pagesCount: number = Math.ceil(totalCount / sort.pageSize);

    /* Если в коллекции postModel не будет документов,
       у которых поле blogId совпадает со значением 
     переменной blogId, то метод find вернет пустой 
     массив ([]) в переменную posts.*/

    if (posts.length === 0) return null;

    /*cоздаю массив постов-он будет потом помещен
    в обект который на фронтенд отправится*/

    const arrayPosts: ViewPost[] = posts.map((post: PostDocument) => {
      return PostViewDto.getViewModel(post);
    });

    const viewPosts: ViewArrayPosts = {
      pagesCount,
      page: sort.pageNumber,
      pageSize: sort.pageSize,
      totalCount,
      items: arrayPosts,
    };

    return viewPosts;
  }

  async getPostsByCorrectBlogId(
    blogId: string,
    queryParamsPostForBlog: QueryParamsPostForBlog,
  ) {
    const { sortBy, sortDirection, pageNumber, pageSize } =
      queryParamsPostForBlog;

    const sort = {
      sortBy: sortBy ?? 'createdAt',

      sortDirection: sortDirection ?? 'desc',

      pageNumber: isNaN(Number(pageNumber)) ? 1 : Number(pageNumber),

      pageSize: isNaN(Number(pageSize)) ? 10 : Number(pageSize),
    };

    const sortDirectionValue = sort.sortDirection === 'asc' ? 1 : -1;

    const filter = { blogId };

    const posts: PostDocument[] = await this.postModel
      .find(filter)

      .sort({ [sort.sortBy]: sortDirectionValue })

      .skip((sort.pageNumber - 1) * sort.pageSize)

      .limit(sort.pageSize)

      .exec();

    const totalCount: number = await this.postModel.countDocuments(filter);

    const pagesCount: number = Math.ceil(totalCount / sort.pageSize);

    /* Если в коллекции postModel не будет документов,
       у которых поле blogId совпадает со значением 
     переменной blogId, то метод find вернет пустой 
     массив ([]) в переменную posts.*/

    if (posts.length === 0) return null;

    /*cоздаю массив постов-он будет потом помещен
    в обект который на фронтенд отправится*/

    const arrayPosts: ViewPost[] = posts.map((post: PostDocument) => {
      return PostViewDto.getViewModel(post);
    });

    const viewPosts: ViewArrayPosts = {
      pagesCount,
      page: sort.pageNumber,
      pageSize: sort.pageSize,
      totalCount,
      items: arrayPosts,
    };

    return viewPosts;
  }

  async getPostById(postId: string): Promise<ViewPost | null> {
    const post: PostDocument | null = await this.postModel.findById(postId);

    if (post) {
      return PostViewDto.getViewModel(post);
    } else {
      return null;
    }
  }
}
