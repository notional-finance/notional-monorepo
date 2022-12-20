async function run(): Promise<void> {
  console.log('Test Job!');
  await Promise.resolve('Test Job!');
}
export const testJob = {
  run,
};
