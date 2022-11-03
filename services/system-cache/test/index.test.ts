// See example here: https://blog.cloudflare.com/miniflare/
import worker, { SystemCache } from '../src/index';

const env = getMiniflareBindings();
const { SYSTEM_CACHE } = env;
const id = SYSTEM_CACHE.idFromName('SYSTEM_CACHE');
const stub = SYSTEM_CACHE.get(id);

beforeAll(async () => {
  await stub.fetch('http://localhost/schedule-alarm');
});

test('it should return a 500 on an invalid version', async () => {
  const resp = await stub.fetch('http://localhost/v1/goerli');
  expect(resp.status).toBe(404);
});
