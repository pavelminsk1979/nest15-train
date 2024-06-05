import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class TokenJwtService {
  secretAccessToken: string;
  expirationAccessToken: string;
  secretRefreshToken: string;
  expirationRefreshToken: string;

  constructor() {
    this.secretAccessToken =
      process.env.ACCESSTOKEN_SECRET || 'accessJwtService';
    this.expirationAccessToken = '5m';
    this.secretRefreshToken =
      process.env.RefreshTOKEN_SECRET || 'refreshJwtService';
    this.expirationRefreshToken = '500m';
  }

  async createAccessToken(userId: string) {
    const accessToken = await jwt.sign(
      { userId: userId },
      this.secretAccessToken,
      { expiresIn: this.expirationAccessToken },
    );

    return accessToken;
  }

  async createRefreshToken(userId: string) {
    const refreshToken = await jwt.sign(
      { userId: userId },
      this.secretRefreshToken,
      { expiresIn: this.expirationRefreshToken },
    );

    return refreshToken;
  }
}
