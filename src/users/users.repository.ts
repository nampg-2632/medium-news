import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { CreateUserInput } from './user.types';
import { UserAlreadyExistsError } from './users.errors';

const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

type PostgresDriverError = Error & {
  code?: string;
  constraint?: string;
};

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async create(input: CreateUserInput): Promise<UserEntity> {
    try {
      const user = this.repository.create(input);
      return await this.repository.save(user);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as PostgresDriverError;

        if (driverError.code !== POSTGRES_UNIQUE_VIOLATION_CODE) {
          throw error;
        }

        const conflictingField = driverError.constraint?.includes('email')
          ? 'email'
          : 'username';
        throw new UserAlreadyExistsError(conflictingField);
      }

      throw error;
    }
  }

  findByEmail(email: string): Promise<UserEntity | null> {
    return this.repository
      .createQueryBuilder('user')
      .where('LOWER(user.email) = LOWER(:email)', { email })
      .getOne();
  }

  findByUsername(username: string): Promise<UserEntity | null> {
    return this.repository
      .createQueryBuilder('user')
      .where('LOWER(user.username) = LOWER(:username)', { username })
      .getOne();
  }

  findById(id: string): Promise<UserEntity | null> {
    return this.repository.findOne({ where: { id } });
  }
}
