import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { PointModule } from '../src/point/point.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let server: any;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [PointModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
    // 포트 동적으로 할당하여 충돌 방지
    await app.listen(0);
    server = app.getHttpServer();
  });

  describe('여러 건의 포인트 충전은 순차적으로 처리되어야 한다.', () => {
    it('should charge points sequentially', async () => {
      const response1 = request(server)
        .patch('/point/1/charge')
        .send({ id: 1, amount: 3000 });

      const response2 = request(server)
        .patch('/point/2/charge')
        .send({ id: 2, amount: 2000 });

      const response3 = request(server)
        .patch('/point/3/charge')
        .send({ id: 3, amount: 1000 });

      // 응답 대기
      const res1 = await response1;
      const res2 = await response2;
      const res3 = await response3;

      const time1 = res1.body.updateMillis;
      const time2 = res2.body.updateMillis;
      const time3 = res3.body.updateMillis;

      // 응답 확인
      expect(res1.statusCode).toEqual(200);
      expect(res1.body.point).toEqual(3000);
      expect(res2.statusCode).toEqual(200);
      expect(res2.body.point).toEqual(2000);
      expect(res3.statusCode).toEqual(200);
      expect(res3.body.point).toEqual(1000);

      // 요청이 순차적으로 처리되었는지 확인
      // 첫 번째 요청이 처리된 후 두 번째 요청이 시작되었는지 확인
      expect(time2).toBeGreaterThanOrEqual(time1);
      // 두 번째 요청이 처리된 후 세 번째 요청이 시작되었는지 확인
      expect(time3).toBeGreaterThanOrEqual(time2);
    });
  });

  describe('여러 건의 포인트 사용은 순차적으로 처리되어야 한다.', () => {
    it('should use points sequentially', async () => {
      await request(server)
        .patch('/point/1/charge')
        .send({ id: 1, amount: 10000 });

      const response1 = request(server)
        .patch('/point/1/use')
        .send({ id: 1, amount: 1000 });

      const response2 = request(server)
        .patch('/point/1/use')
        .send({ id: 2, amount: 2000 });

      const response3 = request(server)
        .patch('/point/1/use')
        .send({ id: 3, amount: 3000 });

      // 응답 대기
      const res1 = await response1;
      const res2 = await response2;
      const res3 = await response3;

      const time1 = res1.body.updateMillis;
      const time2 = res2.body.updateMillis;
      const time3 = res3.body.updateMillis;

      // 응답 확인
      expect(res1.statusCode).toEqual(200);
      expect(res1.body.point).toEqual(-1000);
      expect(res2.statusCode).toEqual(200);
      expect(res2.body.point).toEqual(-2000);
      expect(res3.statusCode).toEqual(200);
      expect(res3.body.point).toEqual(-3000);

      // 요청이 순차적으로 처리되었는지 확인
      // 첫 번째 요청이 처리된 후 두 번째 요청이 시작되었는지 확인
      expect(time2).toBeGreaterThanOrEqual(time1);
      // 두 번째 요청이 처리된 후 세 번째 요청이 시작되었는지 확인
      expect(time3).toBeGreaterThanOrEqual(time2);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
