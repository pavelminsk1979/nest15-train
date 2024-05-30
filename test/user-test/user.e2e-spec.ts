import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import request from 'supertest';

describe('tests for andpoint users', () => {
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

  /*  it('create user', async () => {
    const newLogin = 'login1';

    const loginPasswordBasic64 = 'YWRtaW46cXdlcnR5';

    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        login: newLogin,
        password: 'password1',
        email: 'pavelPav@mail.ru',
      })
      .expect(201);

    //console.log(res.body);
    expect.setState({
      login1: newLogin,
      userId1: res.body.id,
      loginPasswordBasic64,
    });

    expect(res.body.login).toEqual(newLogin);
  });

  it('create user  ... should be mistake ... login exist in bd ', async () => {
    const { login1, loginPasswordBasic64 } = expect.getState();

    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        login: login1,
        password: 'password1',
        email: 'pavelPav@mail.ru',
      })
      .expect(400);

    //console.log(res.body);

    expect(res.body.errors).toEqual([
      { message: 'field login must be unique', field: 'login' },
    ]);
  });

  it('get users', async () => {
    const { loginPasswordBasic64 } = expect.getState();
    await request(app.getHttpServer())
      .get(`/users`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)

      .expect(200);
    //console.log(res.body);
  });

  it('delete  user by id', async () => {
    const { userId1, loginPasswordBasic64 } = expect.getState();
    await request(app.getHttpServer())
      .delete(`/users/${userId1}`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)

      .expect(204);
    //console.log(res.body);
  });

  it('get users', async () => {
    const { loginPasswordBasic64 } = expect.getState();

    const res = await request(app.getHttpServer())
      .get(`/users`)
      .set('Authorization', `Basic ${loginPasswordBasic64}`)

      .expect(200);
    //console.log(res.body);
    expect(res.body.items).toHaveLength(0);
  });*/

  it('create user', async () => {
    const newLogin = '123456789011';

    const loginPasswordBasic64 = 'YWRtaW46cXdlcnR5';

    const res = await request(app.getHttpServer())
      .post('/users')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        login: newLogin,
        password: 'short',
        email: '',
      })
      .expect(400);

    console.log(res.body);

    //expect(res.body.login).toEqual(newLogin);
  });
});
