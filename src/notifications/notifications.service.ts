import {
  Injectable,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(
    NotificationsService.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('notifications')
    private readonly queue: Queue,
  ) {}

  async queueNotification(data: {
    userId: string;
    subscriptionId?: string;
    type:
      | 'RENEWAL_REMINDER'
      | 'PAYMENT_REMINDER'
      | 'SUBSCRIPTION_CANCELED'
      | 'SUBSCRIPTION_RENEWED'
      | 'SYSTEM';
    title: string;
    message: string;
    jobId?: string;
  }) {
    const {
      jobId,
      ...payload
    } = data;

    const job = await this.queue.add(
      'notification',
      payload,
      {
        jobId,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    );

    this.logger.debug(
      `Queued notification job ${job.id}`,
    );

    return job;
  }

  async persist(data: {
    userId: string;
    type:
      | 'RENEWAL_REMINDER'
      | 'PAYMENT_REMINDER'
      | 'SUBSCRIPTION_CANCELED'
      | 'SUBSCRIPTION_RENEWED'
      | 'SYSTEM';
    title: string;
    message: string;
  }) {
    return this.prisma.notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        sentAt: new Date(),
      },
    });
  }
}
