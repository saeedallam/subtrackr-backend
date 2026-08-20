import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { createHash } from 'crypto';
import { PrismaService } from '../common/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
  ) {}

  private hash(value: string) {
    return createHash('sha256').update(value).digest('hex');
  }

  private requiredEnv(name: string) {
    const value = process.env[name];

    if (!value) {
      throw new Error(`${name} must be configured`);
    }

    return value;
  }

  private parseDuration(value: string) {
    const match = value.trim().match(/^(\d+)([smhd])$/i);

    if (!match) {
      throw new Error(
        `Invalid duration: ${value}. Use values such as 15m, 1h, 7d.`,
      );
    }

    const amount = Number(match[1]);
    const unit = match[2].toLowerCase();

    const multipliers: Record<string, number> = {
      s: 1000,
      m: 60 * 1000,
      h: 60 * 60 * 1000,
      d: 24 * 60 * 60 * 1000,
    };

    return amount * multipliers[unit];
  }

  async register(email: string, password: string, name: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const existing = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        name,
        passwordHash: await bcrypt.hash(password, 12),
      },
    });

    return this.issueTokens(user.id, user.email, user.role);
  }

  async login(email: string, password: string) {
    const normalizedEmail = email.trim().toLowerCase();

    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (
      !user ||
      !user.isActive ||
      !(await bcrypt.compare(password, user.passwordHash))
    ) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user.id, user.email, user.role);
  }

  async refresh(refreshToken: string) {
    const refreshSecret = this.requiredEnv('JWT_REFRESH_SECRET');

    let payload: { sub: string; type?: string };

    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (!payload.sub || payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokenHash = this.hash(refreshToken);

    const row = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (
      !row ||
      row.expiresAt <= new Date() ||
      !row.user.isActive
    ) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    await this.prisma.refreshToken.delete({
      where: { id: row.id },
    });

    return this.issueTokens(
      row.user.id,
      row.user.email,
      row.user.role,
    );
  }

  async logout(refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        tokenHash: this.hash(refreshToken),
      },
    });

    return { success: true };
  }

  private async issueTokens(
    id: string,
    email: string,
    role: string,
  ) {
    const accessSecret = this.requiredEnv('JWT_ACCESS_SECRET');
    const refreshSecret = this.requiredEnv('JWT_REFRESH_SECRET');

    const accessTtl =
      process.env.JWT_ACCESS_TTL ?? '15m';

    const refreshTtl =
      process.env.JWT_REFRESH_TTL ?? '7d';

    const accessToken = await this.jwt.signAsync(
      {
        sub: id,
        email,
        role,
      },
      {
        secret: accessSecret,
        expiresIn:
          accessTtl as JwtSignOptions['expiresIn'],
      },
    );

    const refreshToken = await this.jwt.signAsync(
      {
        sub: id,
        type: 'refresh',
      },
      {
        secret: refreshSecret,
        expiresIn:
          refreshTtl as JwtSignOptions['expiresIn'],
      },
    );

    await this.prisma.refreshToken.create({
      data: {
        tokenHash: this.hash(refreshToken),
        userId: id,
        expiresAt: new Date(
          Date.now() + this.parseDuration(refreshTtl),
        ),
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
