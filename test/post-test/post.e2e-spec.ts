import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import request from 'supertest';
import { BlogManagerForTest } from '../utils/blog-manager-for-test';

describe('tests for andpoint posts', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    await app.init();

    //для очистки базы данных
    await request(app.getHttpServer()).delete('/testing/all-data');
  });

  afterAll(async () => {
    await app.close();
  });

  it('should be mistake when create post', async () => {
    const blogManagerForTest = new BlogManagerForTest(app);

    const blog3 = await blogManagerForTest.createBlog(
      'name3',
      'description3',
      'https://www.outue3.com/',
    );

    expect.setState({ idBlog3: blog3.body.id });

    const { idBlog3 } = expect.getState();

    const res = await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: '',
        shortDescription: 'shortDescriptionPost',
        content: 'contentPost',
        blogId: idBlog3,
      })
      .expect(400);
    //console.log(res.body.errors);
    expect(res.body.errors).toEqual([
      {
        field: 'title',
        message: 'Lengt field title should be less 31 simbols',
      },
      {
        field: 'title',
        message: 'title should not be empty',
      },
    ]);
  });

  it('create post', async () => {
    const { idBlog3 } = expect.getState();

    const newTitle = 'titlePost';

    const res = await request(app.getHttpServer())
      .post('/posts')
      .send({
        title: newTitle,
        shortDescription: 'shortDescriptionPost',
        content: 'contentPost',
        blogId: idBlog3,
      })
      .expect(201);

    //console.log(res.body);
    expect.setState({ idPost1: res.body.id });

    expect(res.body.title).toEqual(newTitle);
  });

  it('get posts ', async () => {
    const res = await request(app.getHttpServer())
      .get(`/posts`)

      .expect(200);
    //console.log(res.body);
    expect(res.body.items).toHaveLength(1);
  });

  it('get correct post ', async () => {
    const { idPost1 } = expect.getState();

    const res = await request(app.getHttpServer())
      .get(`/posts/${idPost1}`)

      .expect(200);
    //console.log(res.body);
    expect(res.body.id).toEqual(idPost1);
  });

  it('change  correct post ', async () => {
    const { idPost1, idBlog3 } = expect.getState();

    const newTitle = 'changeTitle';

    await request(app.getHttpServer())
      .put(`/posts/${idPost1}`)
      .send({
        title: newTitle,
        shortDescription: 'shortDescriptionPost',
        content: 'contentPost',
        blogId: idBlog3,
      })

      .expect(204);

    const res = await request(app.getHttpServer())
      .get(`/posts/${idPost1}`)
      .expect(200);

    //console.log(res.body);
    expect(res.body.title).toEqual(newTitle);
  });

  it('get comments for correct post ', async () => {
    const { idPost1 } = expect.getState();
    await request(app.getHttpServer())
      .get(`/posts/${idPost1}/comments`)

      .expect(200);
    //console.log(res.body);
  });

  it('delete blog by id ', async () => {
    const { idPost1 } = expect.getState();

    await request(app.getHttpServer())
      .delete(`/posts/${idPost1}`)

      .expect(204);
  });
});
