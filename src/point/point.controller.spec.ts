import { Test, TestingModule } from '@nestjs/testing';
import { PointController } from './point.controller';
import { DatabaseModule } from '../database/database.module';

describe('AppController', () => {
  let pointController: PointController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      controllers: [PointController],
    }).compile();

    pointController = app.get<PointController>(PointController);
  });

  describe('포인트 충전: /point/:id/charge (PATCH)', () => {
    it('should define charging method', () => {
      expect(pointController.charge).toBeDefined();
    });

    /**
     * 충전된 포인트를 반환한다.
     */
    it('should return charged point', async () => {
      const userPoint = await pointController.charge(1, { amount: 3000 });
      expect(userPoint).toEqual({
        id: 1,
        point: 3000,
        updateMillis: expect.any(Number),
      });
    });

    /**
     * TODO: 동시에 여러 건의 충전 발생 시 순차 처리되어야 한다.
     */

    /**
     * 충전 금액이 0보다 작을 경우 충전이 되지 않아야 한다.
     */
    it('should not charge if amount is less than 0', async () => {
      await expect(
        pointController.charge(1, { amount: -100 }),
      ).rejects.toThrow();
    });

    /**
     * TODO: 1회 최대 충전 금액은 500,000원으로 제한한다.
     */

    /**
     * TODO: 총 충전 금액이 10,000,000 초과할 경우 충전이 되지 않아야 한다.
     */
  });

  describe('포인트 조회: /point/:id (GET)', () => {
    it('should define point getting method', () => {
      expect(pointController.point).toBeDefined();
    });

    /**
     * 충전된 유저의 포인트를 반환해야 한다.
     */
    it('should return point of user', async () => {
      await pointController.charge(1, { amount: 5000 });

      const charged = await pointController.point(1);
      expect(charged).toEqual({
        id: 1,
        point: 5000,
        updateMillis: expect.any(Number),
      });
    });
  });

  describe('포인트 사용: /point/:id/use (PATCH)', () => {
    it('should define point using method', () => {
      expect(pointController.use).toBeDefined();
    });

    /**
     * 사용된 포인트를 반환한다.
     */
    it('should return used point', async () => {
      await pointController.charge(1, { amount: 3000 });

      const userPoint = await pointController.use(1, { amount: 1000 });
      expect(userPoint).toEqual({
        id: 1,
        point: -1000,
        updateMillis: expect.any(Number),
      });
    });

    /**
     * TODO: 동시에 여러 건의 사용 발생 시 순차 처리되어야 한다.
     */

    /**
     * 사용 금액이 0보다 작을 경우 사용이 되지 않아야 한다.
     */
    it('should not use if amount is less than 0', async () => {
      await expect(pointController.use(1, { amount: -100 })).rejects.toThrow();
    });

    /**
     * 잔액이 부족할 경우 사용이 되지 않아야 한다.
     */
    it('should not use if point is not enough', async () => {
      await expect(pointController.use(1, { amount: 10000 })).rejects.toThrow();
    });
  });

  describe('포인트 이용 내역 조회: /point/:id/histories', () => {
    it('should define point history getting method', () => {
      expect(pointController.history).toBeDefined();
    });
    /**
     * 특정 유저의 포인트 충전/이용 내역을 조회한다.
     */
    it('should return point histories of user', async () => {
      await pointController.charge(1, { amount: 3000 });
      await pointController.use(1, { amount: 1000 });

      const histories = await pointController.history(1);
      expect(histories).toEqual([
        {
          id: 1,
          userId: 1,
          amount: 3000,
          type: 'CHARGE',
          timeMillis: expect.any(Number),
        },
        {
          id: 2,
          userId: 1,
          amount: 1000,
          type: 'USE',
          timeMillis: expect.any(Number),
        },
      ]);
    });
  });
});
