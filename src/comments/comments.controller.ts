import { Body, Controller, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PreventCaching } from '../auth/decorators/prevent-caching.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { CommentResponse } from './comment.types';
import { CommentsService } from './comments.service';
import { CommentResponseDto } from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Comments')
@Controller('articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Add a comment to an article' })
  @ApiCreatedResponse({ type: CommentResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiUnprocessableEntityResponse({ description: 'Validation failed' })
  @PreventCaching()
  addComment(
    @Param('slug') slug: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<CommentResponse> {
    return this.commentsService.addComment(slug, dto, authenticatedUser);
  }
}
