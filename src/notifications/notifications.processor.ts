import {
  Logger,
} from '@nestjs/common';
import {
  Processor,
  WorkerHost,
} from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { NotificationsService } from './notifications.service';

@Processor('notifications')
export class NotificationsProcessor
  extends WorkerHost
{
  private readonly logger = new Logger(
    NotificationsProcessor.name,
  );

  constructor(
    private readonly notifications: NotificationsService,
  ) {
    super();
  }

  async process(job: Job) {
    if (job.name === 'notification') {
      try {
        const result =
          await this.notifications.persist(job.data);

        this.logger.log(
          `Notification job ${job.id} completed`,
        );

        return result;
      } catch (error) {
        this.logger.error(
          `Notification job ${job.id} failed on attempt ${job.attemptsMade + 1}`,
          error instanceof Error
            ? error.stack
            : String(error),
        );

        throw error;
      }
    }

    this.logger.warn(
      `Ignoring unknown job ${job.name}`,
    );

    return undefined;
  }
}
