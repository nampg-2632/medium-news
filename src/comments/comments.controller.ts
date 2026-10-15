import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
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
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import type {
  CommentResponse,
  MultipleCommentsResponse,
} from './comment.types';
import { CommentsService } from './comments.service';
import {
  CommentResponseDto,
  MultipleCommentsResponseDto,
} from './dto/comment-response.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('Comments')
@Controller('articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({
    summary: 'Get comments from an article',
    description:
      'Oldest comments first. Authentication is optional; when provided it is used to compute following.',
  })
  @ApiOkResponse({ type: MultipleCommentsResponseDto })
  @ApiUnauthorizedResponse({ description: 'Provided token is invalid' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @PreventCaching()
  getComments(
    @Param('slug') slug: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser | undefined,
  ): Promise<MultipleCommentsResponse> {
    return this.commentsService.getComments(slug, authenticatedUser);
  }

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
