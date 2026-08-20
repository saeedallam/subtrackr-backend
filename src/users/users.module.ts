import { Module } from '@nestjs/common'; import { UsersController } from './users.controller'; import { PrismaService } from '../common/prisma.service'; import { JwtModule } from '@nestjs/jwt';
@Module({imports:[JwtModule.register({})],providers:[PrismaService],controllers:[UsersController]}) export class UsersModule {}
