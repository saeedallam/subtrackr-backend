import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../common/prisma.service';

@Module({ imports: [JwtModule.register({})], providers: [AuthService, PrismaService], controllers: [AuthController], exports: [AuthService, JwtModule] })
export class AuthModule {}
