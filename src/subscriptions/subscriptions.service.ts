import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import {
  PrismaService,
} from '../common/prisma.service';
import {
  SubscriptionStatus,
  BillingInterval,
} from '@prisma/client';

@Injectable()
export class SubscriptionsService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notifications')
    private readonly queue: Queue,
  ) {}

  private calculateNextPeriod(
    from: Date,
    interval: BillingInterval,
  ) {
    const end = new Date(from);

    if (interval === BillingInterval.MONTHLY) {
      end.setMonth(end.getMonth() + 1);
    } else {
      end.setFullYear(end.getFullYear() + 1);
    }

    return end;
  }

  async create(userId: string, planId: string) {
    const plan = await this.prisma.plan.findUnique({
      where: { id: planId },
    });

    if (!plan || !plan.isActive) {
      throw new NotFoundException('Plan not found');
    }

    const start = new Date();
    const end = this.calculateNextPeriod(
      start,
      plan.interval,
    );

    const subscription =
      await this.prisma.subscription.create({
        data: {
          userId,
          planId,
          status: SubscriptionStatus.ACTIVE,
          startedAt: start,
          currentPeriodStart: start,
          currentPeriodEnd: end,
        },
      });

    await this.queue.add(
      'subscription-created',
      {
        userId,
        subscriptionId: subscription.id,
      },
      {
        jobId: `subscription-created:${subscription.id}`,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    );

    return subscription;
  }

  async list(userId: string) {
    return this.prisma.subscription.findMany({
      where: { userId },
      include: { plan: true },
      orderBy: {
        currentPeriodEnd: 'desc',
      },
    });
  }

  async cancel(userId: string, id: string) {
    const subscription =
      await this.prisma.subscription.findFirst({
        where: {
          id,
          userId,
        },
      });

    if (!subscription) {
      throw new NotFoundException(
        'Subscription not found',
      );
    }

    if (
      subscription.status ===
      SubscriptionStatus.CANCELED
    ) {
      return subscription;
    }

    return this.prisma.subscription.update({
      where: { id },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
        autoRenew: false,
      },
    });
  }

  async renewDueSubscriptions() {
    const now = new Date();

    const due =
      await this.prisma.subscription.findMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          autoRenew: true,
          currentPeriodEnd: {
            lte: now,
          },
        },
        include: {
          plan: true,
        },
      });

    let renewed = 0;
    let expired = 0;

    for (const subscription of due) {
      const currentEnd =
        subscription.currentPeriodEnd;

      const nextEnd = this.calculateNextPeriod(
        currentEnd > now ? currentEnd : now,
        subscription.plan.interval,
      );

      const updated =
        await this.prisma.subscription.updateMany({
          where: {
            id: subscription.id,
            status: SubscriptionStatus.ACTIVE,
            autoRenew: true,
            currentPeriodEnd:
              subscription.currentPeriodEnd,
          },
          data: {
            currentPeriodStart:
              subscription.currentPeriodEnd,
            currentPeriodEnd: nextEnd,
            status: SubscriptionStatus.ACTIVE,
          },
        });

      if (updated.count !== 1) {
        continue;
      }

      renewed += 1;

      await this.queue.add(
        'subscription-renewed',
        {
          userId: subscription.userId,
          subscriptionId: subscription.id,
        },
        {
          jobId: `subscription-renewed:${subscription.id}:${nextEnd.toISOString()}`,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000,
          },
          removeOnComplete: 100,
          removeOnFail: 500,
        },
      );
    }

    const inactive =
      await this.prisma.subscription.updateMany({
        where: {
          status: SubscriptionStatus.ACTIVE,
          autoRenew: false,
          currentPeriodEnd: {
            lt: now,
          },
        },
        data: {
          status: SubscriptionStatus.EXPIRED,
        },
      });

    expired = inactive.count;

    return {
      renewed,
      expired,
    };
  }

  async recordUsage(
    userId: string,
    subscriptionId: string | null,
    event: string,
    quantity = 1,
    metadata?: object,
  ) {
    return this.prisma.usageEvent.create({
      data: {
        userId,
        subscriptionId,
        event,
        quantity,
        metadata,
      },
    });
  }
}
