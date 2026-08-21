import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
  ) {}

  async createUser(user: CreateUserDto) {
    const userFound = await this.userRepository.findOne({
      where: {
        correo: user.correo,
      },
    });

    if (userFound) {
      return new HttpException('Correo ya existente', HttpStatus.CONFLICT);
    }
    const newUser = this.userRepository.create(user);
    return this.userRepository.save(newUser);
  }

  getUsers() {
    return this.userRepository.find();
  }

  async getUser(id: string) {
    const userFound = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userFound) {
      return new HttpException('Uusario no encontrado', HttpStatus.NOT_FOUND);
    }
    return userFound;
  }

  async deleteUser(id: string) {
    const resut = await this.userRepository.delete({ id });

    if (resut.affected === 0) {
      return new HttpException('Uusario no encontrado', HttpStatus.NOT_FOUND);
    }
    return resut;
  }

  async updateUser(id: string, user: UpdateUserDto) {
    const userFound = await this.userRepository.findOne({
      where: {
        id,
      },
    });

    if (!userFound) {
      return new HttpException('Uusario no encontrado', HttpStatus.NOT_FOUND);
    }
    return this.userRepository.update({ id }, user);
  }
}
