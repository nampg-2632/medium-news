import { Injectable } from '@nestjs/common';
import { I18nContext } from 'nestjs-i18n';

@Injectable()
export class AppService {
  getHello(i18n: I18nContext): Promise<string> {
    return i18n.t('common.welcome');
  }
}
