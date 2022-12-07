import { getNowSeconds } from './time';

describe('getNowSeconds', () => {
  it('should work', () => {
    const now = getNowSeconds();
    expect(now).toBeTruthy();
  });
});
