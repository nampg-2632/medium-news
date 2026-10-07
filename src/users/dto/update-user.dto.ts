import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

// A missing field means "no change". @IsOptional() is not used because it
// also skips null, which would let { "email": null } through validation.
const isProvided = (_object: object, value: unknown): boolean =>
  value !== undefined;

export class UpdateUserFieldsDto {
  @ApiPropertyOptional({ example: 'user@example.com' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @ValidateIf(isProvided)
  @IsEmail({}, { message: 'email must be a valid email' })
  @MaxLength(320, { message: 'email must be at most 320 characters' })
  email?: string;

  @ApiPropertyOptional({ example: 'user' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @ValidateIf(isProvided)
  @IsString({ message: 'username must be a string' })
  @Length(1, 50, { message: 'username must be between 1 and 50 characters' })
  username?: string;

  @ApiPropertyOptional({ example: 'password123', minLength: 8, maxLength: 128 })
  @ValidateIf(isProvided)
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'password cannot be empty' })
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @MaxLength(128, { message: 'password must be at most 128 characters' })
  password?: string;

  @ApiPropertyOptional({
    example: 'Backend developer',
    nullable: true,
    description: 'Send null to clear the bio',
  })
  @ValidateIf((_object, value) => value !== undefined && value !== null)
  @IsString({ message: 'bio must be a string' })
  @MaxLength(1000, { message: 'bio must be at most 1000 characters' })
  bio?: string | null;
}

export class UpdateUserDto {
  @ApiProperty({ type: UpdateUserFieldsDto })
  @IsDefined({ message: 'user cannot be empty' })
  @ValidateNested()
  @Type(() => UpdateUserFieldsDto)
  user!: UpdateUserFieldsDto;
}
