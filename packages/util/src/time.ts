export function getNowSeconds() {
  const fakeTime = process.env['FAKE_TIME'] || process.env['NX_FAKE_TIME'];
  const allowFakeTIme =
    process.env['NODE_ENV'] === 'development' ||
    process.env['NODE_ENV'] === 'test';
  if (allowFakeTIme && fakeTime) {
    return parseInt(fakeTime, 10);
  }
  return Math.floor(new Date().getTime() / 1000);
}
