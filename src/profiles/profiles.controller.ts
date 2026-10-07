import {
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
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
import { ProfileResponseDto } from './dto/profile-response.dto';
import type { ProfileResponse } from './profile.types';
import { ProfilesService } from './profiles.service';

@ApiTags('Profiles')
@Controller('profiles/:username')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @Post('follow')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Follow a user' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @ApiUnprocessableEntityResponse({ description: 'Cannot follow yourself' })
  @PreventCaching()
  follow(
    @Param('username') username: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<ProfileResponse> {
    return this.profilesService.follow(username, authenticatedUser);
  }

  @Delete('follow')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiOkResponse({ type: ProfileResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @ApiNotFoundResponse({ description: 'Profile not found' })
  @PreventCaching()
  unfollow(
    @Param('username') username: string,
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<ProfileResponse> {
    return this.profilesService.unfollow(username, authenticatedUser);
  }
}
