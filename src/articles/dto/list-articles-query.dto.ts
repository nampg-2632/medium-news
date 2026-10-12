import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export const DEFAULT_ARTICLES_LIMIT = 20;
export const MAX_ARTICLES_LIMIT = 100;

export class FeedArticlesQueryDto {
  @ApiPropertyOptional({
    default: DEFAULT_ARTICLES_LIMIT,
    minimum: 1,
    maximum: MAX_ARTICLES_LIMIT,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(MAX_ARTICLES_LIMIT, {
    message: `limit must be at most ${MAX_ARTICLES_LIMIT}`,
  })
  limit: number = DEFAULT_ARTICLES_LIMIT;

  @ApiPropertyOptional({ default: 0, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'offset must be an integer' })
  @Min(0, { message: 'offset must be at least 0' })
  offset: number = 0;
}

export class ListArticlesQueryDto extends FeedArticlesQueryDto {
  @ApiPropertyOptional({ example: 'dragons', description: 'Filter by tag' })
  @IsOptional()
  @IsString({ message: 'tag must be a string' })
  tag?: string;

  @ApiPropertyOptional({
    example: 'jake',
    description: 'Filter by author username',
  })
  @IsOptional()
  @IsString({ message: 'author must be a string' })
  author?: string;

  @ApiPropertyOptional({
    example: 'jake',
    description: 'Filter by username of a user who favorited the article',
  })
  @IsOptional()
  @IsString({ message: 'favorited must be a string' })
  favorited?: string;
}
