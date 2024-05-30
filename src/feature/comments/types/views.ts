import { ViewPost } from '../../posts/api/types/views';

export enum StatusLike {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

type CommentatorInfo = {
  userId: string;
  userLogin: string;
};

type LikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: StatusLike;
};

export type ViewComment = {
  id: string;
  content: string;
  commentatorInfo: CommentatorInfo;
  createdAt: string;
  likesInfo: LikesInfo;
};

export type ViewArrayComments = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ViewComment[];
};
