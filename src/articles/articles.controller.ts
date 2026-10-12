import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNoContentResponse,
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
  ArticleResponse,
  MultipleArticlesResponse,
} from './article.types';
import { ArticlesService } from './articles.service';
import {
  ArticleResponseDto,
  MultipleArticlesResponseDto,
} from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import {
  FeedArticlesQueryDto,
  ListArticlesQueryDto,
} from './dto/list-articles-query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({
    summary: 'List articles',
    description:
      'Most recent articles first, optionally filtered by tag, author or favorited. ' +
      'Authentication is optional; when provided it is used to compute favorited and following. ' +
      'The article body is not included.',
  })
  @ApiOkResponse({ type: MultipleArticlesResponseDto })
  @ApiUnauthorizedResponse({ description: 'Provided token is invalid' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid query parameters' })
  @PreventCaching()
  listArticles(
    @Query() query: ListArticlesQueryDto,
    @CurrentUser() authenticatedUser: AuthenticatedUser | undefined,
  ): Promise<MultipleArticlesResponse> {
    return this.articlesService.listArticles(query, authenticatedUser);
  }

  // Declared before ':slug' so "feed" is not treated as a slug.
  @Get('feed')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({
    summary: 'Feed articles',
    description:
      'Most recent articles from followed users. The article body is not included.',
  })
  @ApiOkResponse({ type: MultipleArticlesResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @ApiUnprocessableEntityResponse({ description: 'Invalid query parameters' })
  @PreventCaching()
  feedArticles(
    @Query() query: FeedArticlesQueryDto,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<MultipleArticlesResponse> {
    return this.articlesService.feedArticles(query, authenticatedUser);
  }

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

  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({
    summary: 'Update an article',
    description:
      'Only the provided fields are updated. Changing the title regenerates the slug.',
  })
  @ApiOkResponse({ type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @ApiForbiddenResponse({ description: 'Only the author can update' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @ApiUnprocessableEntityResponse({ description: 'Validation failed' })
  @PreventCaching()
  updateArticle(
    @Param('slug') slug: string,
    @Body() dto: UpdateArticleDto,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<ArticleResponse> {
    return this.articlesService.updateArticle(slug, dto, authenticatedUser);
  }

  @Delete(':slug')
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Delete an article' })
  @ApiNoContentResponse({ description: 'Article deleted' })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @ApiForbiddenResponse({ description: 'Only the author can delete' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @PreventCaching()
  deleteArticle(
    @Param('slug') slug: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<void> {
    return this.articlesService.deleteArticle(slug, authenticatedUser);
  }

  @Post(':slug/favorite')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Favorite an article' })
  @ApiOkResponse({ type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @PreventCaching()
  favoriteArticle(
    @Param('slug') slug: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<ArticleResponse> {
    return this.articlesService.favoriteArticle(slug, authenticatedUser);
  }

  @Delete(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Unfavorite an article' })
  @ApiOkResponse({ type: ArticleResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @ApiNotFoundResponse({ description: 'Article not found' })
  @PreventCaching()
  unfavoriteArticle(
    @Param('slug') slug: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<ArticleResponse> {
    return this.articlesService.unfavoriteArticle(slug, authenticatedUser);
  }
}
