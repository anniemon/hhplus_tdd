import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseModule } from '../database/database.module';
import { PointService } from './point.service';

describe('PointService', () => {
  let pointService: PointService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule],
      providers: [PointService],
    }).compile();

    pointService = app.get<PointService>(PointService);
  });

  describe('포인트 충전: /point/:id/charge (PATCH)', () => {
    it('should define charging method', () => {
      expect(pointService.charge).toBeDefined();
    });

    /**
     * 충전된 포인트를 반환한다.
     */
    it('should return charged point', async () => {
      const charged = await pointService.charge(1, { amount: 5000 });
      expect(charged).toEqual({
        id: 1,
        point: 5000,
        updateMillis: expect.any(Number),
      });
    });

    /**
     * 충전 금액이 0보다 작을 경우 충전이 되지 않아야 한다.
     */
    it('should not charge if amount is less than 0', async () => {
      await expect(pointService.charge(1, { amount: -100 })).rejects.toThrow();
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
      expect(pointService.getPoint).toBeDefined();
    });

    /**
     * 충전된 유저의 포인트를 반환해야 한다.
     */
    it('should return point of user', async () => {
      await pointService.charge(1, { amount: 3000 });

      const userPoint = await pointService.getPoint(1);
      expect(userPoint).toEqual({
        id: 1,
        point: 3000,
        updateMillis: expect.any(Number),
      });
    });
  });

  describe('포인트 사용: /point/:id/use (PATCH)', () => {
    it('should define point using method', () => {
      expect(pointService.use).toBeDefined();
    });

    /**
     * 사용한 포인트를 반환한다.
     */
    it('should return used point', async () => {
      await pointService.charge(1, { amount: 4000 });
      const used = await pointService.use(1, { amount: 3000 });
      expect(used).toEqual({
        id: 1,
        point: 3000,
        updateMillis: expect.any(Number),
      });
    });

    /**
     * 사용 금액이 0보다 작을 경우 사용이 되지 않아야 한다.
     */
    it('should not use if amount is less than 0', async () => {
      await expect(pointService.use(1, { amount: -100 })).rejects.toThrow();
    });

    /**
     * 잔액이 부족할 경우 사용이 되지 않아야 한다.
     */
    it('should not use if point is not enough', async () => {
      await pointService.charge(1, { amount: 4000 });

      await expect(pointService.use(1, { amount: 5000 })).rejects.toThrow();
    });
  });

  describe('포인트 이용 내역 조회: /point/:id/histories', () => {
    it('should define point history getting method', () => {
      expect(pointService.getHistories).toBeDefined();
    });
    /**
     * 특정 유저의 포인트 충전/이용 내역을 조회한다.
     */
    it('should return point histories of user', async () => {
      await pointService.charge(1, { amount: 3000 });
      await pointService.use(1, { amount: 1000 });

      const histories = await pointService.getHistories(1);
      expect(histories).toHaveLength(2);
      expect(histories[0]).toEqual({
        id: 1,
        userId: 1,
        amount: 3000,
        type: 'CHARGE',
        timeMillis: expect.any(Number),
      });
      expect(histories[1]).toEqual({
        id: 2,
        userId: 1,
        amount: 1000,
        type: 'USE',
        timeMillis: expect.any(Number),
      });
    });

    /**
     * 특정 유저의 포인트 이용 내역이 없을 경우 빈 배열을 반환한다.
     */
    it('should return empty array if point histories of user is not exist', async () => {
      const histories = await pointService.getHistories(1);
      expect(histories).toHaveLength(0);
    });
  });
});
