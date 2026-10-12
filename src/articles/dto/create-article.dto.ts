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

export const MAX_TAGS_PER_ARTICLE = 20;
export const MAX_TAG_LENGTH = 50;

export const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export const trimStrings = ({ value }: { value: unknown }): unknown =>
  Array.isArray(value)
    ? value.map((item: unknown) =>
        typeof item === 'string' ? item.trim() : item,
      )
    : value;

export class CreateArticleFieldsDto {
  @ApiProperty({ example: 'How to train your dragon', maxLength: 255 })
  @Transform(trimString)
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title cannot be empty' })
  @MaxLength(255, { message: 'title must be at most 255 characters' })
  title!: string;

  @ApiProperty({ example: 'Ever wonder how?' })
  @Transform(trimString)
  @IsString({ message: 'description must be a string' })
  @IsNotEmpty({ message: 'description cannot be empty' })
  description!: string;

  @ApiProperty({ example: 'You have to believe' })
  @IsString({ message: 'body must be a string' })
  @IsNotEmpty({ message: 'body cannot be empty' })
  body!: string;

  @ApiPropertyOptional({
    example: ['reactjs', 'angularjs', 'dragons'],
    type: [String],
    maxItems: MAX_TAGS_PER_ARTICLE,
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

export class CreateArticleDto {
  @ApiProperty({ type: CreateArticleFieldsDto })
  @IsDefined({ message: 'article cannot be empty' })
  @ValidateNested()
  @Type(() => CreateArticleFieldsDto)
  article!: CreateArticleFieldsDto;
}
