import { Injectable } from '@nestjs/common';
import { QueryCommentsForPost } from '../types/models';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../domaims/domain-comment';
import { StatusLike, ViewArrayComments, ViewComment } from '../types/views';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getComments(
    postId: string,
    queryCommentsForPost: QueryCommentsForPost,
  ) {
    const { sortBy, sortDirection, pageNumber, pageSize } =
      queryCommentsForPost;

    const sort = {
      sortBy: sortBy ?? 'createdAt',

      sortDirection: sortDirection ?? 'desc',

      pageNumber: isNaN(Number(pageNumber)) ? 1 : Number(pageNumber),

      pageSize: isNaN(Number(pageSize)) ? 10 : Number(pageSize),
    };

    const sortDirectionValue = sort.sortDirection === 'asc' ? 1 : -1;

    const filter = { postId };

    //let comments: CommentDocument[] = await this.commentModel
    ////////////////////////////////////////
    /*  верхнюю раскоментировать а эту убрать
      когда добавиться СОЗДАНИЕ КОМЕНТАРИЕВ*/
    let comments: any = await this.commentModel
      /////////////////////////////////////

      .find(filter)

      .sort({ [sort.sortBy]: sortDirectionValue })

      .skip((sort.pageNumber - 1) * sort.pageSize)

      .limit(sort.pageSize)

      .exec();

    const totalCount: number = await this.commentModel.countDocuments(filter);

    const pagesCount: number = Math.ceil(totalCount / sort.pageSize);

    /* Если в коллекции postModel не будет документов,
   у которых поле blogId совпадает со значением
 переменной blogId, то метод find вернет пустой
 массив ([]) в переменную posts.*/

    // if (comments.length === 0) return null;
    //////////////////////////////////////////
    //ЭТО ЗАГЛУШКА ПОКАМЕСТЬ НЕТ ДОКУМЕНТОВ comments
    if (comments.length === 0) {
      comments = [
        {
          _id: '664a90ce7edbdddca111111',
          content: 'content1',
          commentatorInfo: { userId: 'userId1', userLogin: 'userLogin1' },
          createdAt: '2024-05-19T23:52:46.1111',
        },
        {
          _id: '664a90ce7edbdddca222',
          content: 'content2',
          commentatorInfo: { userId: 'userId2', userLogin: 'userLogin2' },
          createdAt: '2024-05-19T23:52:46.2222',
        },
      ];
    }
    ////////////////////////////////////////////

    /*cоздаю массив постов-он будет потом помещен
   в обект который на фронтенд отправится*/

    const arrayComments: ViewComment[] = comments.map(
      (comment: CommentDocument) => {
        return this.createViewModelComment(comment);
      },
    );

    const viewComments: ViewArrayComments = {
      pagesCount,
      page: sort.pageNumber,
      pageSize: sort.pageSize,
      totalCount,
      items: arrayComments,
    };

    return viewComments;
  }

  async getCommentById(commentId: string) {
    const comment = await this.commentModel.findById(commentId);

    if (comment) {
      return this.createViewModelComment(comment);
    } else {
      return null;
    }
  }

  createViewModelComment(comment: CommentDocument): ViewComment {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: StatusLike.None,
      },
    };
  }
}
