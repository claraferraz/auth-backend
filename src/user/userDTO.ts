import { IsDateString, IsEmail, IsNotEmpty } from 'class-validator';

export class UserDTO {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  username: string;

  @IsNotEmpty()
  password: string;

  @IsNotEmpty()
  nome: string;

  @IsNotEmpty()
  sobrenome: string;

  @IsNotEmpty()
  @IsDateString()
  data_nasc: Date;

  @IsNotEmpty()
  hobby: string;
}
