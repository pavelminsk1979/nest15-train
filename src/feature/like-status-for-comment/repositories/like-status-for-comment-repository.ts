import { InjectModel } from '@nestjs/mongoose';
import { LikeStatusForPostDocument } from '../../like-status-for-post/domain/domain-like-status-for-post';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import {
  LikeStatusForComment,
  LikeStatusForCommentDocument,
} from '../domain/domain-like-status-for-comment';

@Injectable()
export class LikeStatusForCommentRepository {
  constructor(
    @InjectModel(LikeStatusForComment.name)
    private likeStatusModelForComment: Model<LikeStatusForCommentDocument>,
  ) {}

  async findDocumentByUserIdAndCommentId(userId: string, commentId: string) {
    /* Если документ не будет найден, 
    метод findOne() вернет null.*/

    return this.likeStatusModelForComment.findOne({ userId, commentId });
  }

  async save(newLikeStatusForComment: LikeStatusForCommentDocument) {
    return newLikeStatusForComment.save();
  }

  async findAllDocumentsByArrayCommentId(arrayCommentId: string[]) {
    /* вмассиве в котором каждый элемент это айдишкаКоментария
 и по этим айдишкам найдет все существующие документы*/

    return this.likeStatusModelForComment
      .find({
        postId: { $in: arrayCommentId },
      })
      .sort({ addedAt: -1 });

    /*.sort({ addedAt: -1 }) - это метод, который сортирует
     результаты по полю addedAt в порядке
      убывания (-1). Это означает, что более новые 
      документы будут в начале результата, а более
       старые - в конце*/
  }
}
