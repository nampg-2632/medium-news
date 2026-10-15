import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsDefined,
  IsNotEmpty,
  IsString,
  ValidateNested,
} from 'class-validator';
import { trimString } from '../../common/validation/trim';

export class CreateCommentFieldsDto {
  @ApiProperty({ example: 'It takes a Jacobian' })
  @Transform(trimString)
  @IsString({ message: 'body must be a string' })
  @IsNotEmpty({ message: 'body cannot be empty' })
  body!: string;
}

export class CreateCommentDto {
  @ApiProperty({ type: CreateCommentFieldsDto })
  @IsDefined({ message: 'comment cannot be empty' })
  @ValidateNested()
  @Type(() => CreateCommentFieldsDto)
  comment!: CreateCommentFieldsDto;
}
