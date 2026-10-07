import { applyDecorators, Header } from '@nestjs/common';

export function PreventCaching(): MethodDecorator {
  return applyDecorators(
    Header('Cache-Control', 'no-store'),
    Header('Pragma', 'no-cache'),
    Header('Expires', '0'),
  );
}
