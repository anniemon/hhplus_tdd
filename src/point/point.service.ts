import { BadRequestException, Injectable } from '@nestjs/common';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';
import { TransactionType } from './point.model';
import { PointBody } from './point.dto';

@Injectable()
export class PointService {
  constructor(
    private readonly userPointDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {}

  async getPoint(userId: number) {
    const pointHistory = await this.historyDb.selectAllByUserId(userId);
    const currentPoint = pointHistory.reduce(
      (acc, cur) => {
        if (cur.type === TransactionType.CHARGE) {
          acc.point += cur.amount;
        } else {
          acc.point -= cur.amount;
        }
        return acc;
      },
      { id: userId, point: 0, updateMillis: 0 },
    );
    return currentPoint;
  }

  async getHistories(userId: number) {
    const histories = await this.historyDb.selectAllByUserId(userId);
    return histories;
  }

  async charge(userId: number, pointDto: PointBody) {
    const amount = pointDto.amount;
    if (amount < 0) {
      throw new BadRequestException('충전 금액은 0보다 작을 수 없습니다.');
    }

    const chargedPoint = await this.userPointDb.insertOrUpdate(userId, amount);
    await this.historyDb.insert(
      userId,
      amount,
      TransactionType.CHARGE,
      Date.now(),
    );
    return {
      id: userId,
      point: chargedPoint.point,
      updateMillis: chargedPoint.updateMillis,
    };
  }

  async use(userId: number, pointDto: PointBody) {
    if (pointDto.amount < 0) {
      throw new BadRequestException('사용 금액은 0보다 작을 수 없습니다.');
    }

    const remainPoints = await this.getPoint(userId);
    if (remainPoints.point < pointDto.amount) {
      throw new BadRequestException('잔액이 부족합니다.');
    }

    const amount = pointDto.amount;
    const usedPoint = await this.userPointDb.insertOrUpdate(userId, amount);
    await this.historyDb.insert(
      userId,
      amount,
      TransactionType.USE,
      usedPoint.updateMillis,
    );
    return usedPoint;
  }
}
