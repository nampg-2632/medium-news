import { Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';

export class LoginUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @Transform(({ value }) =>
    typeof value === 'string' ? value.trim().toLowerCase() : value,
  )
  @IsEmail({}, { message: 'email must be a valid email' })
  @MaxLength(320, { message: 'email must be at most 320 characters' })
  email!: string;

  @ApiProperty({ example: 'password123' })
  @IsString({ message: 'password must be a string' })
  @IsNotEmpty({ message: 'password cannot be empty' })
  @MaxLength(128, { message: 'password must be at most 128 characters' })
  password!: string;
}

export class LoginDto {
  @ApiProperty({ type: LoginUserDto })
  @IsDefined({ message: 'user cannot be empty' })
  @ValidateNested()
  @Type(() => LoginUserDto)
  user!: LoginUserDto;
}
