import jwt from 'jsonwebtoken';
import { Injectable } from '@nestjs/common';
import dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class TokenJwtService {
  secretAccessToken: string;
  expirationAccessToken: string;

  constructor() {
    this.secretAccessToken = process.env.ACCESSTOKEN_SECRET || 'secret1';
    this.expirationAccessToken = '5m';
  }

  async createAccessToken(userId: string) {
    const accessToken = await jwt.sign(
      { userId: userId },
      this.secretAccessToken,
      { expiresIn: this.expirationAccessToken },
    );

    return accessToken;
  }
}
