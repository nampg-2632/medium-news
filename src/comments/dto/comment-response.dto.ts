import { ApiProperty } from '@nestjs/swagger';
import { ProfileDto } from '../../profiles/dto/profile-response.dto';

export class CommentDto {
  @ApiProperty({ example: '0b4f3c5e-7c1a-4f8e-9a51-2d6f0c9e1a23' })
  id!: string;

  @ApiProperty({ example: '2016-02-18T03:22:56.637Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2016-02-18T03:22:56.637Z' })
  updatedAt!: Date;

  @ApiProperty({ example: 'It takes a Jacobian' })
  body!: string;

  @ApiProperty({ type: ProfileDto })
  author!: ProfileDto;
}

export class CommentResponseDto {
  @ApiProperty({ type: CommentDto })
  comment!: CommentDto;
}

export class MultipleCommentsResponseDto {
  @ApiProperty({ type: [CommentDto] })
  comments!: CommentDto[];
}
