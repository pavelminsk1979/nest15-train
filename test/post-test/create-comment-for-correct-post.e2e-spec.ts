import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { applyAppSettings } from '../../src/settings/apply-app-settings';
import request from 'supertest';
import { BlogManagerForTest } from '../utils/blog-manager-for-test';
import { EmailSendService } from '../../src/common/service/email-send-service';
import { MockEmailSendService } from '../../src/common/service/mock-email-send-service';

/*для теста надо accessToken и postId*/

/*в этом файле  4 блока describe и  надо  убирать skip
поочереди и запускать поочереди эти блоки вручную

--1 блок describe создаст блог и потом создаст пост к этому блогу
и я буду иметь postId

--2 блок describe сделает регистрацию user и в базе
появится документ и в документе поле
confirmationCode и надо руками скопировать это значение
  это первый шаг чтобы получить accessToken

  --3 блок describe сделает подтверждение
  регистрации - туда надо вставить значение с
  поля confirmationCode  и вторым шагом в этом
  же блоке describe произойдет залогинивание user
  и я получу accessToken

   --4 блок describe  проведет тест на создание
   КОМЕНТАРИЯ для конкретного поста и именно в этом
   тесте буду использовать postId и accessToken*/

////////////////////////////////////////////////

const login = 'loginUs';

const password = 'passwordUs';

const email = 'avelminsk1979@mail.ru';

const loginPasswordBasic64 = 'YWRtaW46cXdlcnR5';

let blogId;

let postId;

let accessToken;
//1
describe('tests for andpoint posts/:postId/comments', () => {
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

  it('create post', async () => {
    const blogManagerForTest = new BlogManagerForTest(app);

    const blog = await blogManagerForTest.createBlog(
      'nameBlog',
      'descriptionBl',
      'https://www.outueBl.com/',
    );

    //console.log(blog.body);

    blogId = blog.body.id;

    const res = await request(app.getHttpServer())
      .post('/posts')
      .set('Authorization', `Basic ${loginPasswordBasic64}`)
      .send({
        title: 'titlePost',
        shortDescription: 'shortDescriptionPost',
        content: 'contentPost',
        blogId: blogId,
      })
      .expect(201);

    postId = res.body.id;

    //console.log(res.body);
  });
});

////////////////////////////////////////////////////////

///////////////////////////////////////////////////////
//2
describe('tests for get registration user', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailSendService)
      .useValue(new MockEmailSendService())

      .compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    await app.init();

    //базу данных не очищаю
  });

  afterAll(async () => {
    await app.close();
  });

  it('registration  user', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration')
      .send({
        login: login,
        password: password,
        email: email,
      })
      .expect(204);
  });
});

/////////////////////////////////////////////////////
/* перед запуском этого ТЕСТА  НАДО

--  ВЗЯТЬ ИЗ БАЗЫ ДАННЫХ у документа user
confirmationCode
"26e24b65-b7ce-410e-bb08-febe06e9674e"

напомню что имеется время протухания поэтому
надо сделать регистрацию и потом подтверждение с
новым-свежим кодом

---по окончанию теста значение поля сменится с фолсе 
на 
isConfirmed:"true"   в базе данных в документе user*/
///////////////////////////////////////////////////
//3
describe('tests for confirm-registration user and for login user', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('registration-confirmation  user', async () => {
    await request(app.getHttpServer())
      .post('/auth/registration-confirmation')
      .send({
        code: '28feb263-cbe2-4728-a9dc-4d7c6245fa45',
      })
      .expect(204);
  });

  it(' login  user ', async () => {
    const res = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        loginOrEmail: login,
        password: password,
      })
      .expect(200);

    //console.log(res.body);
    accessToken = res.body.accessToken;
  });
});

/*Время жизни accessToken должно хватать для тестов 
и его можно посмотреть в файле token-jwt-service.ts*/

//4

describe('tests for create commit for correct post', () => {
  let app;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(EmailSendService)
      .useValue(new MockEmailSendService())

      .compile();

    app = moduleFixture.createNestApplication();

    applyAppSettings(app);

    await app.init();

    //базу данных не очищаю
  });

  afterAll(async () => {
    await app.close();
  });

  it('create commit for correct post ', async () => {
    console.log(accessToken);
    console.log(postId);
    const res = await request(app.getHttpServer())
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({
        content: 'contentForPost contentForPost contentForPost',
      })
      .expect(201);
    console.log(res.body);
  });
});
