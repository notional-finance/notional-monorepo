import { WorkerEntrypoint } from 'cloudflare:workers';
import { fetchWebflowPage, extractWebflowHtml } from './embed';
import { getAllVaults } from './collections';

export default class extends WorkerEntrypoint<{
  ASSETS: Fetcher;
  WEBFLOW_API_TOKEN: string;
}> {
  override async fetch(request: Request) {
    // Check if the pathname ends with a file extension (e.g. .js, .css, .png, etc)
    if (/\.[a-zA-Z0-9]+$/.test(request.url)) {
      return this.env.ASSETS.fetch(request);
    }

    // Otherwise we're dealing with an html request and we have to inject the webflow scripts
    const url = new URL(request.url);

    if (url.pathname.startsWith('/collections/vaults')) {
      const vaults = await getAllVaults(this.env.WEBFLOW_API_TOKEN);
      return new Response(JSON.stringify(vaults), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { webflowHtml, isEmbed } = await fetchWebflowPage(url.pathname);

    if (isEmbed) {
      return new Response(webflowHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      });
    } else {
      const indexHtml = await this.env.ASSETS.fetch(request);
      const modifiedHtml = await extractWebflowHtml(
        webflowHtml,
        await indexHtml.text()
      );
      return new Response(modifiedHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }
  }
}
