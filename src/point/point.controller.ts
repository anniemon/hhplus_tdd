import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { UserPointTable } from '../database/userpoint.table';
import { PointHistoryTable } from '../database/pointhistory.table';
import { PointBody as PointDto } from './point.dto';
import { PointHistory, TransactionType, UserPoint } from './point.model';

@Controller('/point')
export class PointController {
  constructor(
    private readonly userPointDb: UserPointTable,
    private readonly historyDb: PointHistoryTable,
  ) {}

  /**
   * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
   */
  @Get(':id')
  async point(@Param('id') id): Promise<UserPoint> {
    const userId = Number.parseInt(id);
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

  /**
   * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
   */
  @Get(':id/histories')
  async history(@Param('id') id): Promise<PointHistory[]> {
    const userId = Number.parseInt(id);
    const histories = await this.historyDb.selectAllByUserId(userId);
    return histories;
  }

  @Patch(':id/charge')
  async charge(
    @Param('id') id,
    @Body(ValidationPipe) pointDto: PointDto,
  ): Promise<UserPoint> {
    const userId = Number.parseInt(id);
    const amount = pointDto.amount;
    if (amount < 0) {
      throw new Error('충전 금액은 0보다 작을 수 없습니다.');
    }

    const userPoint = await this.userPointDb.selectById(userId);
    const newPoint = userPoint.point + amount;

    const chargedPoint = await this.userPointDb.insertOrUpdate(
      userId,
      newPoint,
    );
    await this.historyDb.insert(
      userId,
      amount,
      TransactionType.CHARGE,
      Date.now(),
    );
    return chargedPoint;
  }

  /**
   * TODO - 특정 유저의 포인트를 사용하는 기능을 작성해주세요.
   */
  @Patch(':id/use')
  async use(
    @Param('id') id,
    @Body(ValidationPipe) pointDto: PointDto,
  ): Promise<UserPoint> {
    const userId = Number.parseInt(id);

    if (pointDto.amount < 0) {
      throw new Error('사용 금액은 0보다 작을 수 없습니다.');
    }

    const remainPoints = await this.point(userId);
    if (remainPoints.point < pointDto.amount) {
      throw new Error('잔액이 부족합니다.');
    }
    const amount = pointDto.amount;

    const usedPoint = await this.userPointDb.insertOrUpdate(userId, -amount);
    await this.historyDb.insert(
      userId,
      amount,
      TransactionType.USE,
      usedPoint.updateMillis,
    );
    return usedPoint;
  }
}
