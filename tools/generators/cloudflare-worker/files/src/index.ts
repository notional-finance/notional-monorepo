export interface Env {}

export default {
  async scheduled(event: ScheduledController, env: Env): Promise<void> {
    // Put any scheduled cron code here
  },
  async fetch(request: Request, env: Env) {
    return new Response('Ok', { status: 200 });
  },
};
