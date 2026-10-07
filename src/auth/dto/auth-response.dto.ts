import { ApiProperty } from '@nestjs/swagger';

export class AuthenticatedUserDto {
  @ApiProperty({ example: 'user@example.com' })
  email!: string;

  @ApiProperty({ example: 'jwt.token.here' })
  token!: string;

  @ApiProperty({ example: 'user' })
  username!: string;

  @ApiProperty({ example: 'Backend developer', nullable: true })
  bio!: string | null;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  image!: string | null;
}

export class AuthResponseDto {
  @ApiProperty({ type: AuthenticatedUserDto })
  user!: AuthenticatedUserDto;
}
