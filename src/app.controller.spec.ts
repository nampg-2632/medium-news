import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;
  const i18n = {
    t: jest.fn().mockResolvedValue('Chào mừng đến với Medium News!'),
  };

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return a localized welcome message', async () => {
      await expect(appController.getHello(i18n as never)).resolves.toBe(
        'Chào mừng đến với Medium News!',
      );
    });
  });
});
