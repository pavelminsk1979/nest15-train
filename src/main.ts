import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { applyAppSettings } from './settings/apply-app-settings';

/* вход в приложение
тут происходит настройка и запуск приложения

документация nest
https://docs.nestjs.com/*/
async function bootstrap() {
  /*  класс создает приложение на основе МОДУЛЯ
 NestFactory.create(AppModule) - Внизу строка кода создает экземпляр
  приложения NestJS на основе модуля AppModule(он в аргументе). AppModule - это корневой
   модуль вашего приложения (ОН СОЗДАЁТСЯ В ФАЙЛЕ app.module)
   который определяет все импорты, контроллеры
    и провайдеры, необходимые для функционирования вашего приложения.
     NestFactory - это класс, предоставляемый NestJS, который
      предоставляет статические методы для создания экземпляра
      приложения*/
  const app = await NestFactory.create(AppModule);

  /*  эта функция в файле   src/settings/apply-app-settings.ts
  и там содержиться код который был ранее в этом
  файле --- ЭТО ПЕРЕНОС КОДА В ДР ФАЙЛ*/
  applyAppSettings(app);
  ///////////////////////////////////////

  /*  После создания экземпляра приложения, вызывается метод listen(),
 который запускает ваше приложение на указанном порту.
 В данном случае, приложение будет слушать порт 3000.*/
  await app.listen(3000);
}

bootstrap();
