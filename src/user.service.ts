import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { JwtService } from '@nestjs/jwt';
import { User } from './user/user';
import { RegisterUserDTO } from './user/registerUserDTO';
import * as bcrypt from 'bcrypt';
import { LoginUserDTO } from './user/loginUserDTO';

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
      throw new BadRequestException('Usuário já existe', {
        cause: new Error(),
        description: 'Usuário já existe',
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

  async loginUser(payload: LoginUserDTO): Promise<UserLoginResponse> {
    const userExists = await this.prisma.user.findFirst({
      where: {
        email: payload.email,
      },
    });

    if (!userExists) {
      throw new BadRequestException('Usuário não encontrado', {
        cause: new Error(),
        description: 'Usuário não encontrado',
      });
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const passwordMatch = await bcrypt.compare(
      payload.password,
      userExists.password,
    );

    if (!passwordMatch) {
      throw new BadRequestException('Usuário ou senha incorretos', {
        cause: new Error(),
        description: 'Usuário ou senha incorretos',
      });
    }
    const jwtPayload = {
      id: userExists.id,
      username: userExists.username,
    };

    return {
      token: this.jwtService.sign(jwtPayload, {
        secret: process.env.JWT_KEY,
      }),
    };
  }
}
