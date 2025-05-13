import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserLoginResponse, UserService } from './user.service';
import { User } from './user/user';
import { RegisterUserDTO } from './user/registerUserDTO';
//import { LoginUserDTO } from './user/loginUserDTO';

@Controller()
export class UserController {
  constructor(private userService: UserService) {}

  @Get()
  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    return await this.userService.getAllUsers();
  }

  @Post('/register')
  async registerUser(
    @Body() payload: RegisterUserDTO,
  ): Promise<UserLoginResponse> {
    return await this.userService.registerUser(payload);
  }
}
