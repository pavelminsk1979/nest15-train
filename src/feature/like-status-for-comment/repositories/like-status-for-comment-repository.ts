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
}
