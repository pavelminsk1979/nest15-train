import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import { ConfigurationType } from '../../settings/env-configuration';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TokenJwtService {
  expirationAccessToken: string;
  expirationRefreshToken: string;

  constructor(private configService: ConfigService<ConfigurationType, true>) {
    this.expirationAccessToken = '5m';
    this.expirationRefreshToken = '500m';
  }

  async createAccessToken(userId: string) {
    const secretAccessToken = this.configService.get(
      'authSettings.ACCESSTOKEN_SECRET',
      { infer: true },
    );
    const accessToken = jwt.sign({ userId: userId }, secretAccessToken, {
      expiresIn: this.expirationAccessToken,
    });

    return accessToken;
  }

  async createRefreshToken(userId: string) {
    const secretRefreshToken = this.configService.get(
      'authSettings.RefreshTOKEN_SECRET',
      { infer: true },
    );
    const refreshToken = jwt.sign({ userId: userId }, secretRefreshToken, {
      expiresIn: this.expirationRefreshToken,
    });

    return refreshToken;
  }

  async checkAccessToken(token: string) {
    debugger;
    try {
      const secretAccessToken = this.configService.get(
        'authSettings.ACCESSTOKEN_SECRET',
        { infer: true },
      );

      const result = (await jwt.verify(token, secretAccessToken)) as {
        userId: string;
      };
      debugger;
      return result.userId;
    } catch (error) {
      console.log(' FILE token-jwt-service.ts' + error);
      return null;
    }
  }
}
