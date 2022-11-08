export function getNowSeconds() {
  if (process.env['NODE_ENV'] === 'development' && process.env['FAKE_TIME']) {
    return parseInt(process.env['FAKE_TIME'], 10);
  }

  return Math.floor(new Date().getTime() / 1000);
}
