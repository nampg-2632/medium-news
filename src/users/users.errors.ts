import { UniqueUserField } from './user.types';

export class UserAlreadyExistsError extends Error {
  constructor(public readonly field: UniqueUserField) {
    super(`${field} has already been taken`);
    this.name = UserAlreadyExistsError.name;
  }
}
