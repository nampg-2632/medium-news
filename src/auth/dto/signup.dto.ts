import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SignupUserDto {
  @ApiProperty({ example: 'user' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString({ message: 'username must be a string' })
  @Length(1, 50, { message: 'username must be between 1 and 50 characters' })
  username!: string;

  @ApiProperty({ example: 'user@example.com' })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'email must be a valid email' })
  @MaxLength(320, { message: 'email must be at most 320 characters' })
  email!: string;

  @ApiProperty({ example: 'password123', minLength: 8, maxLength: 128 })
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'password cannot be empty' })
  @MinLength(8, { message: 'password must be at least 8 characters' })
  @MaxLength(128, { message: 'password must be at most 128 characters' })
  password!: string;
}

export class SignupDto {
  @ApiProperty({ type: SignupUserDto })
  @IsDefined({ message: 'user cannot be empty' })
  @ValidateNested()
  @Type(() => SignupUserDto)
  user!: SignupUserDto;
}
