import { IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class QueryParamsUserInputModel {
  @IsString()
  @IsOptional() //поле необязательно
  /*Применяет трансформацию к значению поля, устанавливая
  значение по умолчанию, если оно не предоставлено*/
  @Transform((value) => value || 'createdAt')
  sortBy: string;

  @IsString()
  @IsOptional() //поле необязательно
  /*декоратор @IsIn проверяет, что значение sortDirection является
 одним из разрешенных значений - 'asc' или 'desc'.*/
  @IsIn(['asc', 'desc'])
  /*Применяет трансформацию к значению поля, устанавливая
  значение по умолчанию, если оно не предоставлено*/
  @Transform((value) => value || 'desc')
  sortDirection: string;

  @IsNumber()
  @IsOptional()
  /*  ---Number(queryParams.pageNumber) пытается преобразовать значение  в числовой тип данных
     ---Если значение не может быть преобразовано в число, то результат будет NaN
     ----isNaN возвращает true, если переданное значение является NaN
     ---- присвою  значение 1    или если пришло число
     тогда присвою приходящее число (В ПАРАМЕТРАХ
     СТРОКИ ПОЭТОМУ Number() нужно
     -- работать будет и с обьектами и с масивами- все корректно отработает */
  @Transform((value) => (isNaN(Number(value)) ? 1 : Number(value)))
  pageNumber: number;

  @IsNumber()
  @IsOptional()
  @Transform((value) => (isNaN(Number(value)) ? 10 : Number(value)))
  pageSize: number;

  @IsString()
  @IsOptional() //поле необязательно
  /*Применяет трансформацию к значению поля, устанавливая
  значение по умолчанию, если оно не предоставлено*/
  @Transform((value) => value || null)
  searchLoginTerm: string;

  @IsString()
  @IsOptional() //поле необязательно
  /*Применяет трансформацию к значению поля, устанавливая
  значение по умолчанию, если оно не предоставлено*/
  @Transform((value) => value || null)
  searchEmailTerm: string;
}
