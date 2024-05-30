import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreatePostInputModel {
  @IsString()
  @IsNotEmpty()
  @Length(1, 30, { message: 'Lengt field title should be less 31 simbols' })
  title: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 100, {
    message: 'Lengt field shortDescription should be less 101 simbols',
  })
  shortDescription: string;

  @IsString()
  @IsNotEmpty()
  @Length(1, 1000, {
    message: 'Lengt field content should be less 1001 simbols',
  })
  content: string;

  @IsString()
  @IsNotEmpty()
  blogId: string;
}
