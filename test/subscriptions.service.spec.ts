import { SubscriptionsService } from '../src/subscriptions/subscriptions.service';

describe('SubscriptionsService', () => {
  it('should be defined', () => {
    const service = new SubscriptionsService(
      {} as any,
      {} as any,
    );
    expect(service).toBeDefined();
  });
});
