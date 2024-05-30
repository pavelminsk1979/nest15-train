import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from '../domains/domain-user';
import { Model, Types } from 'mongoose';
import { UserViewDto } from '../dto/create-user-view-dto';
import { UserQueryParams } from '../api/types/models';
import { ViewArrayUsers, ViewUser } from '../api/types/views';

@Injectable()
/*@Injectable()-декоратор что данный клас инжектируемый
 ОБЯЗАТЕЛЬНО ДОБАВЛЯТЬ  В ФАЙЛ app.module
 в providers: [AppServiceбUserQueryRepository]
 --ТАКЖЕ ОБЯЗАТЕЛЬНО ДОБАВИТЬ ЭТОТ КЛАСС
 КАК ЗАВИСИМОСТЬ  в тот класс который ИМ пользуется
 */
export class UserQueryRepository {
  constructor(
    /* вот тут моделька инжектится
    именно декоратор  @InjectModel  определяет
    что происходит инжектирование
      -- (User.name)  регистрируется по имени
       также как в   app.module  в  imports
       и это будет скорей всего строка 'user'
       --<UserDocument> это тип умного обьекта
       ---userModel - это  свойство текущего класса ,
       это  ТОЖЕ КЛАСС(это Моделька от mongoose).*/
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async getUsers(queryParams: UserQueryParams) {
    const {
      sortBy,
      sortDirection,
      pageNumber,
      pageSize,
      searchLoginTerm,
      searchEmailTerm,
    } = queryParams;

    /*   в обьекте будут
       все поля для сортировки даже если
       их с фронтенда не передадут-будут установлены по умолчанию
       значения согластно свагеру*/
    const sort = {
      sortBy: sortBy ?? 'createdAt',
      /* Оператор ?? выполняет проверку
     --если слева значением null или undefined тогда вернет
      то что справа
      ---если слева нормальное значение тогда вернет его */
      sortDirection: sortDirection ?? 'desc',
      /*  ---Number(queryParams.pageNumber) пытается преобразовать значение  в числовой тип данных
       ---Если значение не может быть преобразовано в число, то результат будет NaN
       ----isNaN возвращает true, если переданное значение является NaN
       ---- присвою  значение 1    или если пришло число
       тогда присвою приходящее число (В ПАРАМЕТРАХ
       СТРОКИ ПОЭТОМУ Number() нужно*/

      pageNumber: isNaN(Number(pageNumber)) ? 1 : Number(pageNumber),

      pageSize: isNaN(Number(pageSize)) ? 10 : Number(pageSize),
      searchLoginTerm: searchLoginTerm ?? null,
      searchEmailTerm: searchEmailTerm ?? null,
    };

    /* при указании направления сортировки в методе sort(), 
       принимаются только значения 1 и -1.*/

    const sortDirectionValue = sort.sortDirection === 'asc' ? 1 : -1;

    //ПРО ФИЛЬТР ЕЩЕ ВНИЗУ этого файла  РАСПИСАЛ

    /*Создается переменная filter
      это обьект в которос свойство с ключом $or
       значение которое под этим ключом это массив а в масиве
       каждый элемент это обьект
       --Переменная filter используется для создания фильтра запроса в базу данных MongoDB
       --Свойство $or в MongoDB позволяет указывать несколько условий для поиска, при которых хотя бы одно из условий должно выполняться
       ---Изначально, filter.$or инициализируется пустым массивом, чтобы затем добавить в него объекты с условиями поиска. Каждый объект в массиве $or представляет отдельное условие поиска.
       ---В коде, условия поиска добавляются в массив filter.$or с помощью метода push()
       */

    const filter: { $or: object[] } = { $or: [] };

    /* если sort.searchLoginTerm  существует 
    тогда добавится в filter
    обьект с ключом login
    а у него будут свойства 
    для поиска
     ---оператор $regex для выполнения поиска по полю login с использованием регулярного выражения. Значение searchLoginTerm используется в качестве шаблона для поиска.
      ---Опция $options: 'i' указывает на регистронезависимый поиск (игнорирование регистра букв)*/

    if (sort.searchLoginTerm) {
      filter.$or.push({
        login: {
          $regex: sort.searchLoginTerm,
          $options: 'i',
        },
      });
    }

    if (sort.searchEmailTerm) {
      filter.$or.push({
        email: {
          $regex: sort.searchEmailTerm,
          $options: 'i',
        },
      });
    }

    /* filter.$or.length ? filter : {}
    эту проверку нужно написать
    иначе если будет filter.$or.length равен нулю тогда
     filter  не пустой обьект  ИБО ПРИ СТАРТЕ 
     let filter: { $or: object[] } = { $or: [] };
     А НАДО ЧТОБ ПУСТОЙ ТОГДА ОБЬЕКТ БЫЛ*/

    const users: UserDocument[] = await this.userModel
      .find(filter.$or.length ? filter : {})

      /*  sort({ [sort.sortBy]: sortDirectionValue })
        Результаты запроса сортируются по полю,
         указанному в переменной sort.sortBy, и
         используется значение sortDirectionValue
          для определения направления сортировки
           (1 для по возрастанию, -1 для по убыванию).*/

      .sort({ [sort.sortBy]: sortDirectionValue })

      /*   skip((sort.pageNumber - 1) * sort.pageSize)
         Пропускаются результаты запроса, чтобы получить страницу с номером sort.pageNumber. Формула
          (sort.pageNumber - 1) * sort.pageSize определяет количество документов, которые нужно пропустить.*/

      .skip((sort.pageNumber - 1) * sort.pageSize)

      /*   .limit(pageSize)
    Ограничивается количество результатов запроса до значения sort.pageSize, чтобы получить определенный размер страницы.*/

      .limit(sort.pageSize)

      /*.exec()
    Выполняется запрос к базе данных и возвращается результат*/

      .exec();

    /*  totalCount  это число- количество документов
    по данному фильтру 
     Выполняется запрос с помощью  модельки  и  с использованием метода countDocuments*/

    const totalCount: number = await this.userModel.countDocuments(
      filter.$or.length ? filter : {},
    );

    /*
pagesCount это число
Вычисляется общее количество страниц путем деления общего количества документов на размер страницы (pageSize), и округление вверх с помощью функции Math.ceil.*/

    const pagesCount: number = Math.ceil(totalCount / sort.pageSize);

    const arrayUsers: ViewUser[] = users.map((user: UserDocument) => {
      return UserViewDto.getViewModel(user);
    });

    /* создаю обьект который ожидают на фронте
    в нем будут полля определяющие
    страницу и количество страниц
    и список МАСИВ документов из базы данных
    но масив я еще отмаплю чтоб привести его к виду
    который соответствует свагеру*/

    const viewUsers: ViewArrayUsers = {
      pagesCount,
      page: sort.pageNumber,
      pageSize: sort.pageSize,
      totalCount,
      items: arrayUsers,
    };
    return viewUsers;
  }

  async getUserById(userId: string) {
    const user = await this.userModel.findOne({
      _id: new Types.ObjectId(userId),
    });

    if (user) {
      return UserViewDto.getViewModel(user);
    } else {
      return null;
    }
  }
}

/*ПРО ФИЛЬТР

 Фильтр настраивается на конкретное поле или поля, которые уже
  существуют в модели данных  тоесть я сам это прописываю
  или name или login.

пример с name  -- if (sort.searchNameTerm) {
      filter.name = { $regex: sort.searchNameTerm, $options: 'i' };
    }

    пример с login---   login: {
          $regex: sort.searchEmailTerm,
          $options: 'i',
        },


---далее поля может не быть--оно может не прити с фронта поэтому
в типизации оно не обязательно
const filter: { name?: { $regex: string; $options: string } } = {};


---если поле  пришло с фронтенда я добавляю его в filter
  if (sort.searchNameTerm) {
      filter.name = { $regex: sort.searchNameTerm, $options: 'i' };
    }
    ///////////////////////////////////
    
    регулярное выражение - это шаблон, который описывает набор символов
     или последовательностей символов. Оно используется для 
     поиска и сопоставления текстовых данных с этим шаблоном.
    
    
Эта конструкция фильтрации $regex используется для выполнения поиска в
 базе данных с использованием регулярного выражения.

$regex - это оператор в базе данных, который позволяет выполнить
 поиск по полю, соответствующему регулярному выражению.

В данном случае, sort.searchNameTerm представляет собой строку,
 которую вы хотите использовать в качестве шаблона для поиска.
  Параметр $options задает опции регулярного выражения, в данном случае i,
   что означает, что поиск будет регистронезависимым (будут найдены 
   как прописные, так и строчные символы).

Эта конструкция фильтрации будет применяться к полю name в вашей базе
 данных. Если значение поля name соответствует шаблону регулярного
  выражения, это значение будет считаться соответствующим и будет
   включено в результаты запроса.

Например, если у вас есть записи в базе данных с именами "John",
 "Johanna" и "Jonathan", и вы используете фильтр { $regex: "Jo",
  $options: "i" }, то все три записи будут считаться 
  соответствующими и будут включены в результаты запроса.

Таким образом, эта конструкция фильтрации $regex позволяет
 вам выполнить поиск в базе данных, сопоставляя значения поля 
 name с заданным регулярным выражением


 */
