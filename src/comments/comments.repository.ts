import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommentEntity } from './comment.entity';
import type { CreateCommentInput } from './comment.types';

@Injectable()
export class CommentsRepository {
  constructor(
    @InjectRepository(CommentEntity)
    private readonly repository: Repository<CommentEntity>,
  ) {}

  // Returns the saved comment with its generated id and createdAt.
  create(input: CreateCommentInput): Promise<CommentEntity> {
    return this.repository.save(this.repository.create(input));
  }
}
