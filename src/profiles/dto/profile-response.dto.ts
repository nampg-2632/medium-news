import { ApiProperty } from '@nestjs/swagger';

export class ProfileDto {
  @ApiProperty({ example: 'user' })
  username!: string;

  @ApiProperty({ example: 'Backend developer', nullable: true })
  bio!: string | null;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', nullable: true })
  image!: string | null;

  @ApiProperty({ example: true })
  following!: boolean;
}

export class ProfileResponseDto {
  @ApiProperty({ type: ProfileDto })
  profile!: ProfileDto;
}
