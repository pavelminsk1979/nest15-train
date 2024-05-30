/*export type CreateUserInputModel = {
  login: string;
  password: string;
  email: string;
};*/

type SortDirection = 'asc' | 'desc';

export type UserQueryParams = {
  sortBy?: string;
  sortDirection?: SortDirection;
  pageNumber?: number;
  pageSize?: number;
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};
