import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { I18n, I18nContext } from 'nestjs-i18n';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Check the API status' })
  @ApiOkResponse({
    description: 'Localized message confirming that the API is running',
    schema: {
      type: 'string',
      example: 'Chào mừng đến với Medium News!',
    },
  })
  getHello(@I18n() i18n: I18nContext): Promise<string> {
    return this.appService.getHello(i18n);
  }
}
