import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
import { UserEntity } from './user.entity';
import { CreateUserInput, UpdateUserInput } from './user.types';
import { UserAlreadyExistsError } from './users.errors';

const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

type PostgresDriverError = Error & {
  code?: string;
  constraint?: string;
};

// Maps a unique-index violation on email/username to a domain error; any
// other error is returned unchanged so the caller can rethrow it.
function toUserAlreadyExistsError(error: unknown): unknown {
  if (!(error instanceof QueryFailedError)) {
    return error;
  }

  const driverError = error.driverError as PostgresDriverError;

  if (driverError.code !== POSTGRES_UNIQUE_VIOLATION_CODE) {
    return error;
  }

  const conflictingField = driverError.constraint?.includes('email')
    ? 'email'
    : 'username';
  return new UserAlreadyExistsError(conflictingField);
}

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
      throw toUserAlreadyExistsError(error);
    }
  }

  async update(id: string, input: UpdateUserInput): Promise<void> {
    if (Object.keys(input).length === 0) {
      return;
    }

    try {
      await this.repository.update({ id }, input);
    } catch (error) {
      throw toUserAlreadyExistsError(error);
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
