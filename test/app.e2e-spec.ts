import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET) returns Vietnamese by default', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Chào mừng đến với Medium News!');
  });

  it('/?lang=en (GET) returns English', () => {
    return request(app.getHttpServer())
      .get('/?lang=en')
      .expect(200)
      .expect('Welcome to Medium News!');
  });

  it('/ (GET) resolves the x-lang header', () => {
    return request(app.getHttpServer())
      .get('/')
      .set('x-lang', 'en')
      .expect(200)
      .expect('Welcome to Medium News!');
  });

  afterEach(async () => {
    await app.close();
  });
});
