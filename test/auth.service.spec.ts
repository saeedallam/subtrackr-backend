import { AuthService } from '../src/auth/auth.service';

describe('AuthService', () => {
  it('should be defined', () => {
    const service = new AuthService({} as any, {} as any);
    expect(service).toBeDefined();
  });
});
