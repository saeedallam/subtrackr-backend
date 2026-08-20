import { Module } from '@nestjs/common'; import { AnalyticsController } from './analytics.controller'; import { PrismaService } from '../common/prisma.service';
@Module({providers:[PrismaService],controllers:[AnalyticsController]}) export class AnalyticsModule {}
