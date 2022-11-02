// See example here: https://blog.cloudflare.com/miniflare/
import worker, { SystemCache } from '../src/index';

console.log(getMiniflareBindings());
const { SYSTEM_CACHE } = getMiniflareBindings();
const id = SYSTEM_CACHE.idFromName('SYSTEM_CACHE');
const stub = SYSTEM_CACHE.get(id);

beforeAll(async () => {
  await stub.fetch('http://localhost/schedule-alarm');
});

test('it should return a 500 on an invalid version', async () => {
  const resp = await stub.fetch('http://localhost/v1/goerli');
  expect(resp.status).toBe(500);
});

// test('it', async () => {
//   // Note we're using Worker APIs in our test, without importing anything extra
//   const request = new Request('http://localhost/');
//   const response = await worker.fetch(request);
//   const resp = await response.json();

//   expect(resp['country']).toBe('N/A');
// });
