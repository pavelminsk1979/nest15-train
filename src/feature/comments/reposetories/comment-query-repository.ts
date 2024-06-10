import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../domaims/domain-comment';
import { StatusLike, ViewArrayComments, ViewComment } from '../types/views';
import { QueryParamsInputModel } from '../../../common/pipes/query-params-input-model';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async getComments(postId: string, queryParams: QueryParamsInputModel) {
    const { sortBy, sortDirection, pageNumber, pageSize } = queryParams;

    const sortDirectionValue = sortDirection === 'asc' ? 1 : -1;

    /*  Переменная filter используется для создания фильтра запроса в базу данных MongoDB*/

    const filter = { postId };

    const comments: CommentDocument[] = await this.commentModel

      .find(filter)

      .sort({ [sortBy]: sortDirectionValue })

      .skip((pageNumber - 1) * pageSize)

      .limit(pageSize)

      .exec();

    const totalCount: number = await this.commentModel.countDocuments(filter);

    const pagesCount: number = Math.ceil(totalCount / pageSize);

    /* Если в коллекции CommentDocument не будет документов,
   у которых поле postId заявленое, то метод find вернет пустой
 массив ([]) */

    /*cоздаю массив коментариев он будет потом помещен
   в items  */

    let arrayComments: ViewComment[];

    if (comments.length === 0) {
      arrayComments = [];
    } else {
      arrayComments = comments.map((comment: CommentDocument) => {
        return this.createViewModelComment(comment);
      });
    }

    const viewComments: ViewArrayComments = {
      pagesCount,
      page: pageNumber,
      pageSize: pageSize,
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
