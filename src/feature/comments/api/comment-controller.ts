import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { CommentQueryRepository } from '../reposetories/comment-query-repository';

@Controller('comments')
export class CommentController {
  constructor(protected commentQueryRepository: CommentQueryRepository) {}

  @Get(':id')
  async getCommentById(@Param('id') commentId: string) {
    const comment = await this.commentQueryRepository.getCommentById(commentId);

    if (comment) {
      return comment;
    } else {
      throw new NotFoundException(
        'comment not found:method-get,url /comments/id',
      );
    }
  }
}
