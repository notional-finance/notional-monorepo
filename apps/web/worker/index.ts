import { WorkerEntrypoint } from 'cloudflare:workers';
import { fetchWebflowPage, extractWebflowHtml } from './embed';
import { calculateKPI } from './kpi';
import { getLatestBlogPosts, subscribeEmail } from './ghost';

export default class extends WorkerEntrypoint<{
  ASSETS: Fetcher;
  WEBFLOW_API_TOKEN: string;
  VIEW_CACHE_R2: R2Bucket;
  GHOST_ADMIN_KEY: string;
  GHOST_CONTENT_KEY: string;
}> {
  override async fetch(request: Request) {
    if (request.url.includes('/kpi')) {
      const kpi = await calculateKPI(this.env.VIEW_CACHE_R2);
      return new Response(JSON.stringify(kpi), {
        headers: {
          'Content-Type': 'text/plain',
        },
      });
    } else if (request.url.includes('/subscribe-email')) {
      const body: { email: string } = await request.json();
      return await subscribeEmail(body.email, this.env.GHOST_ADMIN_KEY);
    } else if (request.url.includes('/latest-blog-posts')) {
      const posts = await getLatestBlogPosts(this.env.GHOST_CONTENT_KEY);
      return new Response(JSON.stringify(posts), {
        headers: {
          'Content-Type': 'application/json',
        },
      });
    }

    // Check if the pathname ends with a file extension (e.g. .js, .css, .png, etc)
    if (/\.[a-zA-Z0-9]+$/.test(request.url)) {
      return this.env.ASSETS.fetch(request);
    }

    // Otherwise we're dealing with an html request and we have to inject the webflow scripts
    const url = new URL(request.url);
    const isEmbed = url.pathname.startsWith('/embed');

    if (isEmbed) {
      const webflowHtml = await fetchWebflowPage(url.pathname, true);
      return new Response(webflowHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      });
    } else {
      // This ensures that webflow is always injected for all HTML pages
      const webflowHtml = await fetchWebflowPage(url.pathname, false);
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
