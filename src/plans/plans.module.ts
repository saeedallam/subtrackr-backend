import { Module } from '@nestjs/common'; import { PlansController } from './plans.controller'; import { PrismaService } from '../common/prisma.service';
@Module({providers:[PrismaService],controllers:[PlansController],exports:[PrismaService]}) export class PlansModule {}
