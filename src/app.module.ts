import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PointModule } from './point/point.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [PointModule, DatabaseModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
