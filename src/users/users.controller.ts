import { Body, Controller, Get, Put, UseGuards } from '@nestjs/common';
import {
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
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import type { UserResponse } from './user.types';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

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
}
