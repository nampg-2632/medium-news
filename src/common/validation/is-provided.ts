// For @ValidateIf on partial updates: a missing field means "no change".
// @IsOptional() is not used because it also skips null, which would let
// { "email": null } through validation.
export const isProvided = (_object: object, value: unknown): boolean =>
  value !== undefined;
