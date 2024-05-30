import { UserDocument } from '../domains/domain-user';
import { ViewUser } from '../api/types/views';

export class UserViewDto {
  static getViewModel(user: UserDocument): ViewUser {
    return {
      id: user._id.toString(),
      login: user.login,
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
