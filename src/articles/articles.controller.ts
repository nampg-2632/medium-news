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
import type { ArticleResponse } from './article.types';
import { ArticlesService } from './articles.service';
import { ArticleResponseDto } from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({
    summary: 'Get an article',
    description:
      'Authentication is optional; when provided it is used to compute favorited and following.',
  })
  @ApiOkResponse({ type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Provided token is invalid' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @PreventCaching()
  getArticle(
    @Param('slug') slug: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser | undefined,
  ): Promise<ArticleResponse> {
    return this.articlesService.getArticle(slug, authenticatedUser);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Create an article' })
  @ApiCreatedResponse({ type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @ApiUnprocessableEntityResponse({ description: 'Validation failed' })
  @PreventCaching()
  createArticle(
    @Body() dto: CreateArticleDto,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<ArticleResponse> {
    return this.articlesService.createArticle(dto, authenticatedUser);
  }
}
