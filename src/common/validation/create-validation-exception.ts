import { UnprocessableEntityException, ValidationError } from '@nestjs/common';
import { createCustomError } from '../errors/custom-error';

function collectMessages(errors: ValidationError[]): string[] {
  return errors.flatMap((error) => [
    ...Object.values(error.constraints ?? {}),
    ...collectMessages(error.children ?? []),
  ]);
}

export function createValidationException(
  errors: ValidationError[],
): UnprocessableEntityException {
  const messages = collectMessages(errors);

  return new UnprocessableEntityException(
    createCustomError(
      messages.length > 0 ? messages : 'request validation failed',
    ),
  );
}
