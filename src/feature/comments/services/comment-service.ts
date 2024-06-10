import { ForbiddenException, Injectable } from '@nestjs/common';
import { PostRepository } from '../../posts/repositories/post-repository';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../domaims/domain-comment';
import { UsersRepository } from '../../users/repositories/user-repository';
import { CommentRepository } from '../reposetories/comment-repository';

@Injectable()
/*@Injectable()-декоратор что данный клас
 инжектируемый--тобишь в него добавляются
 зависимости
 * ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ  В ФАЙЛ app.module
 * providers: [AppService,UsersService]
 провайдер-это в том числе компонент котоый
 возможно внедрить как зависимость*/
export class CommentService {
  constructor(
    protected postRepository: PostRepository,
    protected commentRepository: CommentRepository,
    protected usersRepository: UsersRepository,
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
  ) {}

  async createComment(userId: string, postId: string, content: string) {
    /*надо проверить существует ли такой
    документ-post в базе */

    const post = await this.postRepository.getPostById(postId);

    if (!post) return null;

    /* надо достать документ user по userId
    и из него взять userLogin*/

    const user = await this.usersRepository.getUserById(userId);

    if (!user) return null;

    const userLogin = user.login;

    const newComment: CommentDocument = new this.commentModel({
      content,
      createdAt: new Date().toISOString(),
      postId,
      commentatorInfo: {
        userId,
        userLogin,
      },
    });

    const comment: CommentDocument =
      await this.commentRepository.save(newComment);

    return comment._id.toString();
  }

  async updateComment(userId: string, commentId: string, content: string) {
    //нахожу коментарий в базе данных

    const comment = await this.commentRepository.findCommentById(commentId);

    if (!comment) return null;

    /*   проверяю что этот коментарий принадлежит
   пользователю который  хочет его изменить */

    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenException(
        'comment not belong current user :method put  ,url /comments/commentId',
      );
    }

    /*изменяю в документе comment содержимое
поля comment*/
    comment.content = content;

    //сохраняю в базу измененный документ

    return await this.commentRepository.save(comment);
  }

  async deleteCommentById(userId: string, commentId: string) {
    const comment = await this.commentRepository.findCommentById(commentId);

    if (!comment) return null;

    /*   проверяю что этот коментарий принадлежит
   пользователю который  хочет его изменить */

    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenException(
        'comment not belong current user :method delete   ,url /comments/commentId',
      );
    }

    return this.commentRepository.deleteCommentById(commentId);
  }
}
