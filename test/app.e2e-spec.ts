import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from './../src/app.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('포인트 충전', () => {
    /**
     * 포인트 충전
     */
    it('/point/:id/charge (PATCH)', () => {
      return request(app.getHttpServer())
        .patch('/point/1/charge')
        .send({ amount: 100 })
        .expect(200)
        .expect({ id: 1, point: 100, updateMillis: expect.any(Number) });
    });

    /**
     * 동시에 여러 건의 충전 발생 시 순차 처리되어야 한다.
     */

    /**
     * 중복 충전이 발생할 경우, 충전이 중복되어서는 안된다.
     */

    /**
     * 충전 금액이 0보다 작을 경우 충전이 되지 않아야 한다.
     */

    /**
     * 1회 최대 충전 금액은 500,000원으로 제한한다.
     */

    /**
     * 총 충전 금액이 10,000,000 초과할 경우 충전이 되지 않아야 한다.
     */
  });

  /**
   * 포인트 사용
   */
  describe('포인트 사용', () => {
    it('/point/:id/use (PATCH)', () => {
      return request(app.getHttpServer())
        .patch('/point/1/use')
        .send({ amount: 100 })
        .expect(200)
        .expect({ id: 1, point: 100, updateMillis: expect.any(Number) });
    });

    /**
     * 동시에 여러 건의 사용 발생 시 순차 처리되어야 한다.
     */

    /**
     * 포인트가 부족한 경우 사용할 수 없다.
     * 충전하시겠습니까? 라는 메시지를 띄워주고 에러를 반환한다.
     */

    /**
     * 사용 금액이 0보다 작을 경우 사용이 되지 않아야 한다.
     */

    /**
     * 1회 최대 사용 금액은 500,000원으로 제한한다.
     */

    /**
     * 1일 최대 사용 금액은 1,000,000원으로 제한한다.
     */
  });

  /**
   * 포인트 조회
   */
  describe('포인트 조회', () => {
    it('/point/:id (GET)', () => {
      return request(app.getHttpServer())
        .get('/point/1')
        .expect(200)
        .expect({ id: 1, point: 0, updateMillis: expect.any(Number) });
    });

    /**
     * 존재하지 않는 유저의 포인트 조회 시 0으로 응답한다.
     */

    /**
     * 포인트를 조회할 때, 포인트가 충전된다면 조회가 불가해야한다??
     */

    /**
     * 포인트를 조회할 때, 포인트가 사용된다면 조회가 불가해야한다??
     */
  });

  /**
   * 포인트 이용 내역 조회
   */

  describe('포인트 이용 내역 조회', () => {
    it('/point/:id/histories (GET)', () => {
      return request(app.getHttpServer())
        .get('/point/1/histories')
        .expect(200)
        .expect([]);
    });

    /**
     * 존재하지 않는 유저의 이용 내역 조회 시 빈 배열로 응답한다.
     */

    /**
     * 포인트 이용 내역 조회 시, 포인트가 충전되거나 사용되면 조회가 불가해야한다??
     */
  });

  afterAll(async () => {
    await app.close();
  });
});
