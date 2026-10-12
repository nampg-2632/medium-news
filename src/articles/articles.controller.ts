import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  ApiCreatedResponse,
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
import type { ArticleResponse } from './article.types';
import { ArticlesService } from './articles.service';
import { ArticleResponseDto } from './dto/article-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';

@ApiTags('Articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

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
