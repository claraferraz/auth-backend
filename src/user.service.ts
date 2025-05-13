import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from './user/user';
import { RegisterUserDTO } from './user/registerUserDTO';
import * as bcrypt from 'bcrypt';

export interface UserLoginResponse {
  token?: string;
}
@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async encryptPassword(
    rawPassword: string,
    saltRound: number,
  ): Promise<string> {
    try {
      return await bcrypt.hash(rawPassword, saltRound);
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<Omit<User, 'password'>> {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
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
    return user;
  }

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

  async registerUser(payload: RegisterUserDTO): Promise<UserLoginResponse> {
    const userExists = await this.getUserByEmail(payload.email);
    if (userExists) {
      throw new BadRequestException('User already exists', {
        cause: new Error(),
        description: 'User already exists',
      });
    }

    const hash: string = await this.encryptPassword(payload.password, 10);
    payload.password = hash;
    const createdUser = await this.prisma.user.create({
      data: payload,
    });
    return {
      token: this.jwtService.sign(createdUser, {
        secret: process.env.JWT_KEY,
      }),
    };
  }
}
