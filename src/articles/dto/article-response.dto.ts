import { ApiProperty, OmitType } from '@nestjs/swagger';
import { ProfileDto } from '../../profiles/dto/profile-response.dto';

export class ArticleDto {
  @ApiProperty({ example: 'how-to-train-your-dragon' })
  slug!: string;

  @ApiProperty({ example: 'How to train your dragon' })
  title!: string;

  @ApiProperty({ example: 'Ever wonder how?' })
  description!: string;

  @ApiProperty({ example: 'It takes a Jacobian' })
  body!: string;

  @ApiProperty({ example: ['dragons', 'training'], type: [String] })
  tagList!: string[];

  @ApiProperty({ example: '2016-02-18T03:22:56.637Z' })
  createdAt!: Date;

  @ApiProperty({ example: '2016-02-18T03:48:35.824Z' })
  updatedAt!: Date;

  @ApiProperty({ example: false })
  favorited!: boolean;

  @ApiProperty({ example: 0 })
  favoritesCount!: number;

  @ApiProperty({ type: ProfileDto })
  author!: ProfileDto;
}

export class ArticleListItemDto extends OmitType(ArticleDto, ['body']) {}

export class ArticleResponseDto {
  @ApiProperty({ type: ArticleDto })
  article!: ArticleDto;
}

export class MultipleArticlesResponseDto {
  @ApiProperty({ type: [ArticleListItemDto] })
  articles!: ArticleListItemDto[];

  @ApiProperty({ example: 1 })
  articlesCount!: number;
}
