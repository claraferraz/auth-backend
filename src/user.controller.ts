import { Controller, Get } from '@nestjs/common';
import { UserService } from './user.service';
import { User } from './user/user';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  getAllUsers(): Promise<Omit<User, 'password'>[]> {
    return this.userService.getAllUsers();
  }
}
