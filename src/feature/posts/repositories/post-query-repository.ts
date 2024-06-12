import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Post, PostDocument } from '../domains/domain-post';
import { StatusLike, ViewArrayPosts, ViewPost } from '../api/types/views';
import { QueryParamsInputModel } from '../../../common/pipes/query-params-input-model';
import { LikeStatusForPostRepository } from '../../like-status-for-post/repositories/like-status-for-post-repository';
import { LikeStatusForPostDocument } from '../../like-status-for-post/domain/domain-like-status-for-post';
import { LikeStatus } from '../../../common/types';

@Injectable()
/*@Injectable()-декоратор что данный клас
 инжектируемый--тобишь в него добавляются
 зависимости
 * ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ  В ФАЙЛ app.module
 * providers: [AppService,UsersService]
 провайдер-это в том числе компонент котоый
 возможно внедрить как зависимость*/
export class PostQueryRepository {
  constructor(
    @InjectModel(Post.name) private postModel: Model<PostDocument>,
    protected likeStatusForPostRepository: LikeStatusForPostRepository,
  ) {}

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
    userId: string | null,
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

    let arrayPosts: ViewPost[] = [];

    const viewPosts: ViewArrayPosts = {
      pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: arrayPosts,
    };

    /* Если в коллекции postModel не будет документов,
       c указаным  blogId , то метод find вернет пустой
     массив ([]) в переменную posts.*/

    if (posts.length === 0) {
      arrayPosts = [];
      return viewPosts;
    }

    /* из posts( массив постов)
     - достану из каждого поста  _id(aйдишку поста)
     буду иметь массив айдишек */

    const arrayPostId: string[] = posts.map((e) => e._id.toString());

    /*из коллекции LikeStatusForPost
      достану все документы у которых postId такиеже
       как в массиве айдишек */

    const arrayDocummentsLikeStatus: LikeStatusForPostDocument[] | null =
      await this.likeStatusForPostRepository.findAllDocumentsByArrayPostId(
        arrayPostId,
      );

    if (!arrayDocummentsLikeStatus) {
      arrayPosts = [];
      return viewPosts;
    }

    /*создаю массив постов с информацией о лайках
     его буду  отправлять на фронтенд*/

    arrayPosts = await this.createArrayPostsWithInfoLikeStatus(
      userId,
      posts,
      arrayDocummentsLikeStatus,
    );

    /*
    //////////////////////////////////////////
        /!*cоздаю массив постов-он будет потом помещен
        в обект который на фронтенд отправится*!/

        const arrayPosts: ViewPost[] = posts.map((post: PostDocument) => {
          return this.createViewModelPost(post);
        });
    /////////////////////////////////////////////////*/

    return viewPosts;
  }

  async getPostById(postId: string) {
    const post: PostDocument | null = await this.postModel.findById(postId);

    if (post) {
      return this.createViewModelNewPost(post);
    } else {
      return null;
    }
  }

  /*  ЭТОТ МЕТОД ДЛЯ СОЗДАНИЯ ВИДА !!! НОВОГО ПОСТА !!!
   * отличатся будет потомучто у нового поста еще не будет
   * лайков и поэтому значения лайков будут нулевые
   * вобще нет запросов за лайками в базу данных
   * */
  createViewModelNewPost(post: PostDocument): ViewPost {
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

  async createArrayPostsWithInfoLikeStatus(
    // для myStatus
    userId: string | null,
    //массив постов
    posts: PostDocument[],
    /*все документы  ЛАЙКИ из базы данных  относящиеся 
     к постам которые в массиве постов */
    arrayDocummentsLikeStatus: LikeStatusForPostDocument[],
  ): Promise<ViewPost[]> {
    /* массив постов мапом прохожу и для каждого поста 
     делаю операции */

    const arrayPostsWithLikeInfo = posts.map((post: PostDocument) => {
      /*для одного поста нахожу все документы
      из массива ЛАЙКОВ */

      const allLikeStatusDocuments: LikeStatusForPostDocument[] =
        arrayDocummentsLikeStatus.filter(
          (e) => e.postId === post._id.toString(),
        );

      /* получаю  массив документов с Like*/

      const like: LikeStatusForPostDocument[] = allLikeStatusDocuments.filter(
        (e) => e.likeStatus === LikeStatus.LIKE,
      );

      /* получаю  массив документов с DisLike*/

      const dislike: LikeStatusForPostDocument[] =
        allLikeStatusDocuments.filter(
          (e) => e.likeStatus === LikeStatus.DISLIKE,
        );

      /* получаю из массива со статусом Like
      три документа  новейших по дате
      --сортировку я произвел когда все документы
       ЛАЙКСТАТУСДЛЯПОСТОВ из   базыданных доставал */

      const threeDocumentWithLike: LikeStatusForPostDocument[] = like.slice(
        0,
        3,
      );

      /*  надо узнать какой статус поставил пользователь данному посту, 
        тот пользователь который данный запрос делает - его айдишка
         имеется */

      let likeStatusCurrentPostCurrentUser: LikeStatus;

      const result = allLikeStatusDocuments.find((e) => e.userId === userId);

      if (!result) {
        likeStatusCurrentPostCurrentUser = LikeStatus.NONE;
      } else {
        likeStatusCurrentPostCurrentUser = result.likeStatus;
      }

      /*  использую еще один метод (МАПЕР) который преобразует 
        каждый(один) ПРЕОБРАЗУЕТ К ТАКОМУ ВИДУ КОТОРЫЙ ОЖИДАЕТ
        ФРОНТЕНД 
        ---post: PostDocument- напомню нахожусь внутри метода map
        и post - это текущий документ 
        ----like/dislike: LikeStatusForPostDocument[] массивы -далее я 
        длинны их использую 
        ---likeStatusCurrentPostCurrentUser: LikeStatus - статус 
        пользователя который текущий запрос делает 
        ---threeDocumentWithLike: LikeStatusForPostDocument[]
        три документа - это самые последние(новые) которые
        ЛАЙК этому посту поставили 
       */

      const postWithLikeInfo: ViewPost = this.producePostWithInfoLikeStatus(
        post,
        like,
        dislike,
        likeStatusCurrentPostCurrentUser,
        threeDocumentWithLike,
      );

      return postWithLikeInfo;
    });

    return arrayPostsWithLikeInfo;
  }

  producePostWithInfoLikeStatus(
    post: PostDocument,
    /*post- это один документ */

    like: LikeStatusForPostDocument[],
    /*  это массив - мне надо их количество-length*/

    dislike: LikeStatusForPostDocument[],
    /*  это массив - мне надо их количество-length*/

    likeStatusCurrentPostCurrentUser: LikeStatus,
    /*   статус
    пользователя который текущий запрос делает*/

    threeDocumentWithLike: LikeStatusForPostDocument[],
    /*   тири документа - это самые последние(новые) которые
   ЛАЙК этому посту поставили*/
  ): ViewPost {}
}
