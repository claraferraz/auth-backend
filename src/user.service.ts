import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import { UserDTO } from './user/userDTO';
import { User } from './user/user';

export interface UserLoginResponse {
  token?: string;
}

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async getAllUsers(): Promise<Omit<User, 'password'>[]> {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        password: false,
        nome: true,
        sobrenome: true,
        data_nasc: true,
        hobby: true,
      },
    });
    return users;
  }
}
