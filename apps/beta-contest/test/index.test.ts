// See example here: https://blog.cloudflare.com/miniflare/
import worker from '../src/index';

const env = getMiniflareBindings();

test('should return a 200', async () => {
  // Note we're using Worker APIs in our test, without importing anything extra
  const request = new Request('http://localhost/');
  const response = await worker.fetch(request, env);
  expect(response.status).toBe(200);
});
