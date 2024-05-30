import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import request from 'supertest';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import { BlogManagerForTest } from '../utils/blog-manager-for-test';

describe('tests for andpoint blogs', () => {
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

  it('should be mistake when create blog', async () => {
    const res = await request(app.getHttpServer())
      .post('/blogs')
      .send({
        name: '',
        description: 'description',
        websiteUrl: 'https://www.outue1.com/',
      })
      .expect(400);
    //console.log(res.body.errors);
    expect(res.body.errors).toEqual([
      {
        message: 'Lengt field name should be less 16 simbols',
        field: 'name',
      },
      { message: 'name should not be empty', field: 'name' },
    ]);
  });

  it('create 2   blogs', async () => {
    const blogManagerForTest = new BlogManagerForTest(app);

    const blog1 = await blogManagerForTest.createBlog(
      'name1',
      'description1',
      'https://www.outue1.com/',
    );

    const blog2 = await blogManagerForTest.createBlog(
      'name1',
      'description1',
      'https://www.outue1.com/',
    );

    const res = await request(app.getHttpServer()).get('/blogs').expect(200);

    //console.log(res.body);
    //console.log(blog1.body);

    expect.setState({ idBlog1: blog1.body.id });
    /*ложу значения  чтоб в других 
    тестах достать и использовать*/
    expect.setState({ idBlog2: blog2.body.id });

    //const { idBlog1 } = expect.getState();

    //console.log(idBlog1);

    expect(res.body.items[0].name).toEqual(blog1.body.name);
  });

  it('get correct blog ', async () => {
    const { idBlog1 } = expect.getState();

    const res = await request(app.getHttpServer())
      .get(`/blogs/${idBlog1}`)

      .expect(200);
    //console.log(res.body);
    expect(res.body.id).toEqual(idBlog1);
  });

  it('delete blog by id ', async () => {
    const { idBlog1 } = expect.getState();

    await request(app.getHttpServer())
      .delete(`/blogs/${idBlog1}`)

      .expect(204);
  });

  it('NO delete blog ... incorect id  ', async () => {
    await request(app.getHttpServer())
      .delete(`/blogs/66553b9af8e4959d6015b8d`)

      .expect(404);
  });

  it('change  correct blog ', async () => {
    const { idBlog2 } = expect.getState();

    const newName = 'changeName';

    await request(app.getHttpServer())
      .put(`/blogs/${idBlog2}`)
      .send({
        name: newName,
        description: 'changeDescription',
        websiteUrl: 'https://www.changeOutue1.com/',
      })

      .expect(204);

    const res = await request(app.getHttpServer())
      .get(`/blogs/${idBlog2}`)
      .expect(200);

    //console.log(res.body);
    expect(res.body.name).toEqual(newName);
  });

  it('create post for correct  blog ', async () => {
    const { idBlog2 } = expect.getState();

    await request(app.getHttpServer())
      .post(`/blogs/${idBlog2}/posts`)
      .send({
        title: 'title1',
        shortDescription: 'shortDescription1',
        content: 'content',
      })

      .expect(204);

    const res = await request(app.getHttpServer())
      .get(`/blogs/${idBlog2}/posts`)
      .expect(200);

    // console.log(res.body);

    expect(res.body.items[0].blogId).toEqual(idBlog2);
  });
});
