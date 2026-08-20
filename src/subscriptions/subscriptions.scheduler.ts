import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SubscriptionsService } from './subscriptions.service';

@Injectable()
export class SubscriptionsScheduler {
  private readonly logger = new Logger(
    SubscriptionsScheduler.name,
  );

  constructor(
    private readonly subscriptions: SubscriptionsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async processRenewals() {
    const result =
      await this.subscriptions.renewDueSubscriptions();

    this.logger.log(
      `Renewal sweep completed: renewed=${result.renewed}, expired=${result.expired}`,
    );
  }
}
