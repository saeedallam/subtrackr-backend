import { NotificationsService } from '../src/notifications/notifications.service';

describe('NotificationsService', () => {
  it('should be defined', () => {
    const service = new NotificationsService(
      {} as any,
      {} as any,
    );
    expect(service).toBeDefined();
  });
});
