/*export type CreateBlogInputModel = {
  name: string;
  description: string;
  websiteUrl: string;
};*/

type SortDirection = 'asc' | 'desc';

export type BlogQueryParams = {
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  pageNumber?: number;
  pageSize?: number;
};

/*export type UpdateBlogInputModel = {
  name: string;
  description: string;
  websiteUrl: string;
};*/

/*export type CreatePostForBlogInputModel = {
  title: string;
  shortDescription: string;
  content: string;
};*/

export type QueryParamsPostForBlog = {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
};
