import { Injectable } from '@nestjs/common';
import { CommentDocument } from '../domaims/domain-comment';

@Injectable()
/*@Injectable()-декоратор что данный клас инжектируемый
 * ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ  В ФАЙЛ app.module
 * providers: [AppService,UsersService,UsersRepository]*/
export class CommentRepository {
  /*  constructor(
      /!* вот тут моделька инжектится
      именно декоратор  @InjectModel
       *!/
  
      @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    ) {}*/

  async save(newComment: CommentDocument) {
    return newComment.save();
  }
}
