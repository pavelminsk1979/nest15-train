import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domains/domain-post';
import { StatusLike, ViewArrayPosts, ViewPost } from '../api/types/views';
import { QueryParamsInputModel } from '../../../common/pipes/query-params-input-model';

@Injectable()
/*@Injectable()-декоратор что данный клас
 инжектируемый--тобишь в него добавляются
 зависимости
 * ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ  В ФАЙЛ app.module
 * providers: [AppService,UsersService]
 провайдер-это в том числе компонент котоый
 возможно внедрить как зависимость*/
export class PostQueryRepository {
  constructor(@InjectModel(Post.name) private postModel: Model<PostDocument>) {}

  async getPosts(queryParamsPostForBlog: QueryParamsInputModel) {
    const { sortBy, sortDirection, pageNumber, pageSize } =
      queryParamsPostForBlog;

    const sortDirectionValue = sortDirection === 'asc' ? 1 : -1;

    const posts: PostDocument[] = await this.postModel
      .find({})

      .sort({ [sortBy]: sortDirectionValue })

      .skip((pageNumber - 1) * pageSize)

      .limit(pageSize)

      .exec();

    const totalCount: number = await this.postModel.countDocuments({});

    const pagesCount: number = Math.ceil(totalCount / pageSize);

    /*cоздаю массив постов-он будет потом помещен
    в обект который на фронтенд отправится*/

    const arrayPosts: ViewPost[] = posts.map((post: PostDocument) => {
      return this.createViewModelPost(post);
    });

    const viewPosts: ViewArrayPosts = {
      pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: arrayPosts,
    };

    return viewPosts;
  }

  async getPostsByCorrectBlogId(
    blogId: string,
    queryParams: QueryParamsInputModel,
  ) {
    const { sortBy, sortDirection, pageNumber, pageSize } = queryParams;

    const sortDirectionValue = sortDirection === 'asc' ? 1 : -1;

    const filter = { blogId };

    const posts: PostDocument[] = await this.postModel
      .find(filter)

      .sort({ [sortBy]: sortDirectionValue })

      .skip((pageNumber - 1) * pageSize)

      .limit(pageSize)

      .exec();

    const totalCount: number = await this.postModel.countDocuments(filter);

    const pagesCount: number = Math.ceil(totalCount / pageSize);

    /* Если в коллекции postModel не будет документов,
       у которых поле blogId совпадает со значением 
     переменной blogId, то метод find вернет пустой 
     массив ([]) в переменную posts.*/

    if (posts.length === 0) return null;

    /*cоздаю массив постов-он будет потом помещен
    в обект который на фронтенд отправится*/

    const arrayPosts: ViewPost[] = posts.map((post: PostDocument) => {
      return this.createViewModelPost(post);
    });

    const viewPosts: ViewArrayPosts = {
      pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: arrayPosts,
    };

    return viewPosts;
  }

  async getPostById(postId: string) {
    const post: PostDocument | null = await this.postModel.findById(postId);

    if (post) {
      return this.createViewModelPost(post);
    } else {
      return null;
    }
  }

  createViewModelPost(post: PostDocument): ViewPost {
    return {
      id: post._id.toString(),
      title: post.title,
      shortDescription: post.shortDescription,
      content: post.content,
      blogId: post.blogId,
      blogName: post.blogName,
      createdAt: post.createdAt,
      extendedLikesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: StatusLike.None,
        newestLikes: [
          {
            addedAt: '',
            userId: '',
            login: '',
          },
        ],
      },
    };
  }
}

/*

/!* Если в коллекции postModel не будет документов,
    у которых поле blogId совпадает со значением
  переменной blogId, то метод find вернет пустой
  массив ([]) в переменную posts.*!/

if (posts.length === 0) return null;*/
