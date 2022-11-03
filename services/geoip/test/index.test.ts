// See example here: https://blog.cloudflare.com/miniflare/
import worker from '../src/index';

test('should return a country', async () => {
  // Note we're using Worker APIs in our test, without importing anything extra
  const request = new Request('http://localhost/');
  const response = await worker.fetch(request);
  const resp = await response.json();

  expect(resp['country']).toBe('N/A');
});
