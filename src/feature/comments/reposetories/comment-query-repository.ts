import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../domaims/domain-comment';
import { CommentWithLikeInfo, LikesInfo } from '../types/views';
import { QueryParamsInputModel } from '../../../common/pipes/query-params-input-model';
import { LikeStatus } from '../../../common/types';
import { LikeStatusForCommentDocument } from '../../like-status-for-comment/domain/domain-like-status-for-comment';
import { LikeStatusForCommentRepository } from '../../like-status-for-comment/repositories/like-status-for-comment-repository';

@Injectable()
export class CommentQueryRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    protected likeStatusForCommentRepository: LikeStatusForCommentRepository,
  ) {}

  async getComments(
    userId: string | null,
    postId: string,
    queryParams: QueryParamsInputModel,
  ) {
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

    if (comments.length === 0) {
      return {
        pagesCount,
        page: pageNumber,
        pageSize: pageSize,
        totalCount,
        items: [],
      };
    }

    const arrayComments: CommentWithLikeInfo[] = await this.makeArrayComments(
      userId,
      comments,
    );

    return {
      pagesCount,
      page: pageNumber,
      pageSize: pageSize,
      totalCount,
      items: arrayComments,
    };
  }

  async makeArrayComments(
    userId: string | null,
    comments: CommentDocument[],
  ): Promise<CommentWithLikeInfo[]> {
    /* из массива коментариев получу массив коментарийАЙДИ*/

    const arrayCommentId = comments.map((e) => e._id.toString());

    /*из коллекции LikeStatusForComment
    достану все документы которые имеют commentId
   из массива  arrayCommentsId  плюс они будут отсортированы
    (первый самый новый)*/

    const allLikeStatusDocumentsForCurrentComments: LikeStatusForCommentDocument[] =
      await this.likeStatusForCommentRepository.findAllDocumentsByArrayCommentId(
        arrayCommentId,
      );

    /*создаю массив коментариев с информацией о лайках
    (он пойдет на фронтенд)
    мапом прохожу и для каждого поста
    делаю операции для получения обьекта   тип- CommentWithLikeInfo*/

    /* ЗДЕСЬ return  возвращает наружу  результат 
   работы метода map (массив коментариев с информацией о лайках)*/
    return comments.map((comment: CommentDocument) => {
      /* отдельный метод (createAloneCommentWithLikeInfo) который создаст 
      один комент со всеми вложеностями
      -с информацией о лайках*/

      const commentWithLikeInfo: CommentWithLikeInfo =
        this.createAloneCommentWithLikeInfo(
          userId,
          comment,
          allLikeStatusDocumentsForCurrentComments,
        );

      return commentWithLikeInfo;
    });
  }

  createAloneCommentWithLikeInfo(
    userId: string | null,
    /* userId чтоб определить статус того 
пользователя который данный запрос делает */

    comment: CommentDocument,
    /* нахожусь внутри метода map
   и comment - это текущий документ*/

    allLikeStatusDocumentsForAllCurrentComments: LikeStatusForCommentDocument[],
    /*  метод map обрабатывает массив и в этом массиве
  много коментариев И ЭТО ВСЕ ЛАЙКИ КО ВСЕМ
  ЭТИМ КОМЕНТАРИЯМ*/
  ) {
    /*для текущего комента  нахожу все документы
    из массива ЛАЙКОВ */

    const allLikeStatusDocumentForAloneComment: LikeStatusForCommentDocument[] =
      allLikeStatusDocumentsForAllCurrentComments.filter(
        (e) => e.commentId === comment._id.toString(),
      );

    /* получаю  массив документов с Like*/

    const like: LikeStatusForCommentDocument[] =
      allLikeStatusDocumentForAloneComment.filter(
        (e) => e.likeStatus === LikeStatus.LIKE,
      );

    /* получаю  массив документов с DisLike*/

    const dislike: LikeStatusForCommentDocument[] =
      allLikeStatusDocumentForAloneComment.filter(
        (e) => e.likeStatus === LikeStatus.DISLIKE,
      );

    /*  надо узнать какой статус поставил пользователь данному коменту,
    тот пользователь который данный запрос делает - его айдишка
     имеется */

    let myStatus: LikeStatus;

    const result = allLikeStatusDocumentsForAllCurrentComments.find(
      (e) => e.userId === userId,
    );

    if (result) {
      myStatus = result.likeStatus;
    } else {
      myStatus = LikeStatus.NONE;
    }

    const likesInfo: LikesInfo = {
      likesCount: like.length,
      dislikesCount: dislike.length,
      myStatus,
    };

    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: comment.createdAt,
      likesInfo,
    };
  }

  async getCommentById(commentId: string) {
    const comment = await this.commentModel.findById(commentId);

    if (comment) {
      return this.createViewModelComment(comment);
    } else {
      return null;
    }
  }

  createViewModelComment(comment: CommentDocument): CommentWithLikeInfo {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
      createdAt: comment.createdAt,
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: LikeStatus.NONE,
      },
    };
  }
}
