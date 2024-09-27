import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  ValidationPipe,
} from '@nestjs/common';
import { PointBody as PointDto } from './point.dto';
import { PointHistory, UserPoint } from './point.model';
import { PointService } from './point.service';
import { PromiseQueue } from './promise-queue';

@Controller('/point')
export class PointController {
  constructor(private readonly pointService: PointService) {}
  /**
   * TODO - 특정 유저의 포인트를 조회하는 기능을 작성해주세요.
   */
  @Get(':id')
  async point(@Param('id') id): Promise<UserPoint> {
    const userId = Number.parseInt(id);
    return await this.pointService.getPoint(userId);
  }

  /**
   * TODO - 특정 유저의 포인트 충전/이용 내역을 조회하는 기능을 작성해주세요.
   */
  @Get(':id/histories')
  async history(@Param('id') id): Promise<PointHistory[]> {
    const userId = Number.parseInt(id);
    return await this.pointService.getHistories(userId);
  }

  @Patch(':id/charge')
  async charge(
    @Param('id') id,
    @Body(ValidationPipe) pointDto: PointDto,
  ): Promise<UserPoint> {
    const userId = Number.parseInt(id);
    const queue = new PromiseQueue();

    return await queue.enqueue(async () => {
      return await this.pointService.charge(userId, pointDto);
    });
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

    const queue = new PromiseQueue();
    return await queue.enqueue(async () => {
      const userPoint = await this.pointService.use(userId, pointDto);
      return {
        id: userId,
        point: -pointDto.amount,
        updateMillis: userPoint.updateMillis,
      };
    });
  }
}
