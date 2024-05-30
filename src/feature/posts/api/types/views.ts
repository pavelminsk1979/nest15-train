export enum StatusLike {
  None = 'None',
  Like = 'Like',
  Dislike = 'Dislike',
}

type NewestLikes = {
  addedAt: string;
  userId: string;
  login: string;
};

type ExtendedLikesInfo = {
  likesCount: number;
  dislikesCount: number;
  myStatus: StatusLike;
  newestLikes: NewestLikes[];
};

export type ViewPost = {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: string;
  extendedLikesInfo: ExtendedLikesInfo;
};

export type ViewArrayPosts = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: ViewPost[];
};
