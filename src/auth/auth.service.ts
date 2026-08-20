import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwt: JwtService) {}
  async register(email: string, password: string, name: string) {
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email already registered');
    const user = await this.prisma.user.create({ data: { email, name, passwordHash: await bcrypt.hash(password, 12) } });
    return this.tokens(user.id, user.email, user.role);
  }
  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.passwordHash)) || !user.isActive) throw new UnauthorizedException('Invalid credentials');
    return this.tokens(user.id, user.email, user.role);
  }
  private tokens(id: string, email: string, role: string) { return { accessToken: this.jwt.sign({ sub:id,email,role }, { secret: process.env.JWT_SECRET || 'dev-secret', expiresIn: process.env.JWT_ACCESS_TTL || '15m' }), refreshToken: this.jwt.sign({ sub:id,type:'refresh' }, { secret: process.env.JWT_SECRET || 'dev-secret', expiresIn: process.env.JWT_REFRESH_TTL || '7d' }) }; }
}
