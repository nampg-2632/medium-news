import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsString,
  MaxLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { isProvided } from '../../common/validation/is-provided';
import {
  MAX_TAG_LENGTH,
  MAX_TAGS_PER_ARTICLE,
  trimString,
  trimStrings,
} from './create-article.dto';

export class UpdateArticleFieldsDto {
  @ApiPropertyOptional({
    example: 'Did you train your dragon?',
    maxLength: 255,
    description: 'Changing the title also regenerates the slug',
  })
  @Transform(trimString)
  @ValidateIf(isProvided)
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title cannot be empty' })
  @MaxLength(255, { message: 'title must be at most 255 characters' })
  title?: string;

  @ApiPropertyOptional({ example: 'Ever wonder how?' })
  @Transform(trimString)
  @ValidateIf(isProvided)
  @IsString({ message: 'description must be a string' })
  @IsNotEmpty({ message: 'description cannot be empty' })
  description?: string;

  @ApiPropertyOptional({ example: 'You have to believe' })
  @ValidateIf(isProvided)
  @IsString({ message: 'body must be a string' })
  @IsNotEmpty({ message: 'body cannot be empty' })
  body?: string;

  @ApiPropertyOptional({
    example: ['dragons', 'training'],
    type: [String],
    maxItems: MAX_TAGS_PER_ARTICLE,
    description: 'Replaces all tags of the article when provided',
  })
  @Transform(trimStrings)
  @ValidateIf(isProvided)
  @IsArray({ message: 'tagList must be an array of strings' })
  @ArrayMaxSize(MAX_TAGS_PER_ARTICLE, {
    message: `tagList must contain at most ${MAX_TAGS_PER_ARTICLE} tags`,
  })
  @IsString({ each: true, message: 'each tag must be a string' })
  @IsNotEmpty({ each: true, message: 'tags cannot be empty' })
  @MaxLength(MAX_TAG_LENGTH, {
    each: true,
    message: `each tag must be at most ${MAX_TAG_LENGTH} characters`,
  })
  tagList?: string[];
}

export class UpdateArticleDto {
  @ApiProperty({ type: UpdateArticleFieldsDto })
  @IsDefined({ message: 'article cannot be empty' })
  @ValidateNested()
  @Type(() => UpdateArticleFieldsDto)
  article!: UpdateArticleFieldsDto;
}
