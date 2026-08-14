import { Injectable } from '@nestjs/common';
import { DatabaseError } from 'pg';
import { DatabaseService } from '../database/database.service';
import { CreateUserInput, UserRecord } from './user.types';
import { UserAlreadyExistsError } from './users.errors';

type UserRow = {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  bio: string | null;
  image: string | null;
  created_at: Date;
  updated_at: Date;
};

const createUserQuery = `
  INSERT INTO users (email, username, password_hash)
  VALUES ($1, $2, $3)
  RETURNING
    id,
    email,
    username,
    password_hash,
    bio,
    image,
    created_at,
    updated_at
`;

const findUserByEmailQuery = `
  SELECT
    id,
    email,
    username,
    password_hash,
    bio,
    image,
    created_at,
    updated_at
  FROM users
  WHERE LOWER(email) = LOWER($1)
`;

const findUserByIdQuery = `
  SELECT
    id,
    email,
    username,
    password_hash,
    bio,
    image,
    created_at,
    updated_at
  FROM users
  WHERE id = $1
`;

const POSTGRES_UNIQUE_VIOLATION_CODE = '23505';

function mapUser(row: UserRow): UserRecord {
  return {
    id: row.id,
    email: row.email,
    username: row.username,
    passwordHash: row.password_hash,
    bio: row.bio,
    image: row.image,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(input: CreateUserInput): Promise<UserRecord> {
    try {
      const result = await this.databaseService.query<UserRow>(
        createUserQuery,
        [input.email, input.username, input.passwordHash],
      );

      return mapUser(result.rows[0]);
    } catch (error) {
      if (
        error instanceof DatabaseError &&
        error.code === POSTGRES_UNIQUE_VIOLATION_CODE
      ) {
        const field = error.constraint?.includes('email')
          ? 'email'
          : 'username';
        throw new UserAlreadyExistsError(field);
      }

      throw error;
    }
  }

  async findByEmail(email: string): Promise<UserRecord | null> {
    const result = await this.databaseService.query<UserRow>(
      findUserByEmailQuery,
      [email],
    );

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }

  async findById(id: string): Promise<UserRecord | null> {
    const result = await this.databaseService.query<UserRow>(
      findUserByIdQuery,
      [id],
    );

    return result.rows[0] ? mapUser(result.rows[0]) : null;
  }
}
