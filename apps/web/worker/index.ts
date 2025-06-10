import { WorkerEntrypoint } from 'cloudflare:workers';

const WEBFLOW_ROOT = 'https://webflow.notional.finance';
const SITE_ID = '6807f00bedf01dce8388f0e2';

export default class extends WorkerEntrypoint {
  override async fetch(request: Request) {
    const url = new URL(request.url);
    const targetPath = url.pathname.replace(/^\/embed/, '') || '/';
    const webflowURL = `${WEBFLOW_ROOT}${targetPath}`;

    const res = await fetch(webflowURL);
    if (!res.ok)
      return new Response('Failed to load Webflow page', { status: 502 });

    const html = await res.text();

    // // Inject base tag for relative paths
    // html = html.replace(/<head>/i, `<head><base href="${WEBFLOW_ROOT}">`);

    return new Response(html, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300',
      },
    });
  }
}
