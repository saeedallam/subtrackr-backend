import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { PlansModule } from './plans/plans.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PrismaService } from './common/prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    BullModule.forRootAsync({ inject: [ConfigService], useFactory: (config: ConfigService) => ({ connection: { host: config.get('REDIS_HOST','localhost'), port: Number(config.get('REDIS_PORT',6379)), password: config.get('REDIS_PASSWORD') || undefined } }) }),
    AuthModule,
    UsersModule,
    PlansModule,
    SubscriptionsModule,
    NotificationsModule,
    AnalyticsModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
