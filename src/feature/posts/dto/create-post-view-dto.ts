import { PostDocument } from '../domains/domain-post';
import { StatusLike, ViewPost } from '../api/types/views';

export class PostViewDto {
  static getViewModel(post: PostDocument): ViewPost {
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
