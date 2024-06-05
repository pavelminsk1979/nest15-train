type SortDirection = 'asc' | 'desc';

export type BlogQueryParams = {
  searchNameTerm?: string;
  sortBy?: string;
  sortDirection?: SortDirection;
  pageNumber?: number;
  pageSize?: number;
};

export type QueryParamsPostForBlog = {
  pageNumber?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: SortDirection;
};
