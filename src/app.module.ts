import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersController } from './feature/users/api/user-controller';
import { UsersService } from './feature/users/services/user-service';
import { UsersRepository } from './feature/users/repositories/user-repository';
import { User, UserSchema } from './feature/users/domains/domain-user';
import { UserQueryRepository } from './feature/users/repositories/user-query-repository';
import { BlogController } from './feature/blogs/api/blog-controller';
import { Blog, BlogShema } from './feature/blogs/domains/domain-blog';
import { BlogRepository } from './feature/blogs/repositories/blog-repository';
import { BlogService } from './feature/blogs/services/blog-service';
import { BlogQueryRepository } from './feature/blogs/repositories/blog-query-repository';
import { Post, PostShema } from './feature/posts/domains/domain-post';
import { PostRepository } from './feature/posts/repositories/post-repository';
import { PostQueryRepository } from './feature/posts/repositories/post-query-repository';
import { PostService } from './feature/posts/services/post-service';
import { PostsController } from './feature/posts/api/post-controller';
import { CommentQueryRepository } from './feature/comments/reposetories/comment-query-repository';
import {
  Comment,
  CommentShema,
} from './feature/comments/domaims/domain-comment';
import { CommentController } from './feature/comments/api/comment-controller';
import { TestController } from './feature/test/test-controller';
import dotenv from 'dotenv';
import { HashPasswordService } from './common/service/hash-password-service';
import { AuthController } from './feature/auth/api/auth-controller';
import { AuthService } from './feature/auth/services/auth-service';
import { TokenJwtService } from './common/service/token-jwt-service';
import { EmailSendService } from './common/service/email-send-service';

dotenv.config();

/*декоратора @Module()---ЭТО КАК В ЭКСПРЕС КОМПОЗИШЕН-РУУТ..
в NestJS используются для организации
компонентов, контроллеров и сервисов в единое логическое целое.
  ---imports: Это массив других модулей, которые должны
быть импортированы в текущий модуль.Здесь вы можете указать модули,
которые предоставляют функциональность, необходимую для работы
компонентов и сервисов текущего модуля
  ---controllers: Это массив контроллеров, которые находятся
   в этом модуле. Контроллеры в NestJS отвечают за
   обработку HTTP-запросов и определение маршрутов.
    ---- providers: Это массив провайдеров, которые будут
     доступны в этом модуле. Провайдеры в NestJS отвечают
      за создание экземпляров сервисов и предоставление
      их внедрению зависимостей.   */
@Module({
  imports: [
    /*  тут подключение к удаленной базе данных ...url aдрес
   этой базы а в конце название конкретного отдела(projectNest)*/
    MongooseModule.forRoot(process.env.MONGO_URL ?? ''),
    /*тут регистрация СХЕМЫ монгусовской модельки*/
    MongooseModule.forFeature([
      {
        /*--User.name  у класса(не у экземпляра класса) берут имя оно будет примерно такое -- 'user'*/
        name: User.name,
        schema: UserSchema,
      },
      { name: Blog.name, schema: BlogShema },
      { name: Post.name, schema: PostShema },
      { name: Comment.name, schema: CommentShema },
    ]),
  ],
  /*все контроллеры приложения должны тут добавлены */
  controllers: [
    UsersController,
    BlogController,
    PostsController,
    CommentController,
    TestController,
    AuthController,
  ],
  /* все сервисы приложения должны тут добавлены */
  providers: [
    UsersService,
    UsersRepository,
    UserQueryRepository,
    BlogService,
    BlogRepository,
    BlogQueryRepository,
    PostRepository,
    PostQueryRepository,
    PostService,
    CommentQueryRepository,
    HashPasswordService,
    AuthService,
    TokenJwtService,
    EmailSendService,
  ],
})
/*export class AppModule {} в данном контексте
представляет сам модуль. То что собрано -сконфигурировано
выше--это и есть МОДУЛЬ и это как часть чегото, и часть
эту можно как npm-пакет кудато вставить-добавить*/
export class AppModule {}
