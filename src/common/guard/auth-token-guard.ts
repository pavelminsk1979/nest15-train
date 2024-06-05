import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { TokenJwtService } from '../service/token-jwt-service';

@Injectable()
export class AuthTokenGuard implements CanActivate {
  constructor(protected tokenJwtService: TokenJwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const authHeader = request.headers.authorization;
    if (!authHeader) {
      throw new UnauthorizedException();
    }

    const titleAndAccessToken = authHeader.split(' ');
    //'Bearer lkdjflksdfjlj889765akljfklaj'

    const userId = await this.tokenJwtService.checkAccessToken(
      titleAndAccessToken[1],
    );

    if (userId) {
      request['userId'] = userId;
      return true;
    } else {
      throw new UnauthorizedException();
    }
  }
}
