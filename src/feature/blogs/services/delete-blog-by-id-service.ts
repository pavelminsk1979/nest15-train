import { Injectable } from '@nestjs/common';
import { BlogRepository } from '../repositories/blog-repository';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';

export class DeleteBlogByIdCommand {
  constructor(public blogId: string) {}
}

@CommandHandler(DeleteBlogByIdCommand)
@Injectable()
export class DeleteBlogByIdService
  implements ICommandHandler<DeleteBlogByIdCommand>
{
  constructor(protected blogRepository: BlogRepository) {}

  async execute(command: DeleteBlogByIdCommand) {
    return this.blogRepository.deleteBlogById(command.blogId);
  }
}

/*export class DeleteBlogByIdCommand {
  constructor(public blogId: string) {}
}

ТУТ БЕЗ  implements -это для типизации для контроля

@CommandHandler(DeleteBlogByIdCommand)
@Injectable()
export class DeleteBlogByIdService {
  constructor(protected blogRepository: BlogRepository) {}

  async execute(command: DeleteBlogByIdCommand) {
    return this.blogRepository.deleteBlogById(command.blogId);
  }
}*/
