import { StatusLike, ViewComment } from '../types/views';
import { CommentDocument } from '../domaims/domain-comment';

export class CommentViewDto {
  static getViewModel(comment: CommentDocument): ViewComment {
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
