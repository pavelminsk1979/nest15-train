import { InjectModel } from '@nestjs/mongoose';
import {
  LikeStatusForPost,
  LikeStatusForPostDocument,
} from '../domain/domain-like-status-for-post';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';

@Injectable()
export class LikeStatusForPostRepository {
  constructor(
    @InjectModel(LikeStatusForPost.name)
    private likeStatusModelForPost: Model<LikeStatusForPostDocument>,
  ) {}

  async findDocumentByUserIdAndPostId(userId: string, postId: string) {
    /* Если документ не будет найден, 
    метод findOne() вернет null.*/

    return this.likeStatusModelForPost.findOne({ userId, postId });
  }

  async save(newLikeStatusForPost: LikeStatusForPostDocument) {
    return newLikeStatusForPost.save();
  }
}
