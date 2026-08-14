import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiSecurity,
  ApiTags,
  ApiTooManyRequestsResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import type { AuthenticatedUser, UserResponse } from './auth.types';
import { CurrentUser } from './decorators/current-user.decorator';
import { PreventCaching } from './decorators/prevent-caching.decorator';
import { LoginDto } from './dto/login.dto';
import { SignupDto } from './dto/signup.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Users')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('users')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @ApiUnprocessableEntityResponse({ description: 'Validation failed' })
  @PreventCaching()
  signup(@Body() dto: SignupDto): Promise<UserResponse> {
    return this.authService.signup(dto);
  }

  @Post('users/login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(ThrottlerGuard)
  @ApiOperation({ summary: 'Authenticate a user' })
  @ApiOkResponse({ type: UserResponseDto })
  @ApiUnauthorizedResponse({ description: 'Invalid email or password' })
  @ApiUnprocessableEntityResponse({ description: 'Validation failed' })
  @ApiTooManyRequestsResponse({ description: 'Too many login attempts' })
  @PreventCaching()
  login(@Body() dto: LoginDto): Promise<UserResponse> {
    return this.authService.login(dto);
  }

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
    return this.authService.getCurrentUser(authenticatedUser);
  }
}
