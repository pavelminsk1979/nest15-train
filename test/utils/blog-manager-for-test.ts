import { INestApplication } from '@nestjs/common';
import request from 'supertest';

export class BlogManagerForTest {
  constructor(protected readonly app: INestApplication) {}

  async createBlog(name: string, description: string, websiteUrl: string) {
    const blog = await request(this.app.getHttpServer())
      .post('/blogs')
      .send({
        name,
        description,
        websiteUrl,
      })
      .expect(201);

    return blog;
  }
}
