import {
  Body,
  Controller,
  Delete,
  Get,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOkResponse,
  ApiOperation,
  ApiPayloadTooLargeResponse,
  ApiSecurity,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import type { AuthenticatedUser } from '../auth/auth.types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PreventCaching } from '../auth/decorators/prevent-caching.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UserAvatarService } from './user-avatar.service';
import type { UserResponse } from './user.types';
import { UsersService } from './users.service';

const AVATAR_MAX_SIZE_BYTES = 2 * 1024 * 1024;

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly userAvatarService: UserAvatarService,
  ) {}

  @Get('user')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Get the current authenticated user' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @PreventCaching()
  getCurrentUser(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): UserResponse {
    return this.usersService.getCurrentUser(authenticatedUser);
  }

  @Put('user')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({
    summary: 'Update the current authenticated user',
    description: 'Only the provided fields are updated.',
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @ApiUnprocessableEntityResponse({
    description: 'Validation failed or email/username already taken',
  })
  @PreventCaching()
  updateCurrentUser(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponse> {
    return this.usersService.updateCurrentUser(authenticatedUser, dto);
  }

  // The guard runs before the interceptor, so unauthenticated requests are
  // rejected before the file is read into memory.
  @Put('user/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      limits: { fileSize: AVATAR_MAX_SIZE_BYTES, files: 1 },
    }),
  )
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Upload or replace the current user avatar' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      required: ['avatar'],
      properties: {
        avatar: {
          type: 'string',
          format: 'binary',
          description: 'JPG/JPEG, PNG or WebP image, at most 2 MB',
        },
      },
    },
  })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @ApiUnprocessableEntityResponse({ description: 'Missing or invalid image' })
  @ApiPayloadTooLargeResponse({ description: 'Image is larger than 2 MB' })
  @PreventCaching()
  updateAvatar(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
    @UploadedFile() file: Express.Multer.File | undefined,
  ): Promise<UserResponse> {
    return this.userAvatarService.updateAvatar(authenticatedUser, file);
  }

  @Delete('user/avatar')
  @UseGuards(JwtAuthGuard)
  @ApiSecurity('token')
  @ApiOperation({ summary: 'Remove the current user avatar' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Authentication is required' })
  @PreventCaching()
  removeAvatar(
    @CurrentUser() authenticatedUser: AuthenticatedUser,
  ): Promise<UserResponse> {
    return this.userAvatarService.removeAvatar(authenticatedUser);
  }
}
