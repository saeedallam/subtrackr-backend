import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsScheduler } from './subscriptions.scheduler';
import { PrismaService } from '../common/prisma.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'notifications',
    }),
  ],
  controllers: [SubscriptionsController],
  providers: [
    SubscriptionsService,
    SubscriptionsScheduler,
    PrismaService,
  ],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
