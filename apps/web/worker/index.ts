import { WorkerEntrypoint } from 'cloudflare:workers';

const WEBFLOW_ROOT = 'https://webflow.notional.finance';
const SITE_ID = '6807f00bedf01dce8388f0e2';

class ScriptCollector {
  headScripts: { src: string | null; content: string | null }[] = [];
  headLinks: { href: string; rel: string | null }[] = [];
  bodyScripts: { src: string | null; content: string | null }[] = [];
  bodyContent = '';
  private inBody = false;
  private inHead = false;

  element(element: Element) {
    if (element.tagName === 'head') {
      this.inHead = true;
    } else if (element.tagName === 'body') {
      this.inBody = true;
      this.inHead = false;
    } else if (element.tagName === 'script') {
      const src = element.getAttribute('src');
      const content = element.textContent;
      if (src) {
        if (this.inHead) {
          this.headScripts.push({ src, content: null });
        } else {
          this.bodyScripts.push({ src, content: null });
        }
      } else if (content) {
        if (this.inHead) {
          this.headScripts.push({ src: null, content });
        } else {
          this.bodyScripts.push({ src: null, content });
        }
      }
    } else if (element.tagName === 'link') {
      const href = element.getAttribute('href');
      const rel = element.getAttribute('rel');
      if (href) {
        this.headLinks.push({ href, rel });
      }
    } else if (this.inBody) {
      this.bodyContent += element.outerHTML;
    }
  }
}

class ScriptInjector {
  constructor(
    private headScripts: { src: string | null; content: string | null }[],
    private headLinks: { href: string; rel: string | null }[],
    private bodyScripts: { src: string | null; content: string | null }[]
  ) {}

  element(element: Element) {
    if (element.tagName === 'head') {
      // Inject head scripts and links
      this.headScripts.forEach(({ src, content }) => {
        if (src) {
          element.append(`<script src="${src}"></script>`, { html: true });
        } else if (content) {
          element.append(`<script type="text/javascript">${content}</script>`, {
            html: true,
          });
        }
      });
      this.headLinks.forEach(({ href, rel }) => {
        element.append(`<link href="${href}" rel="${rel || 'stylesheet'}">`, {
          html: true,
        });
      });
    } else if (element.tagName === 'body') {
      // Inject body scripts
      this.bodyScripts.forEach(({ src, content }) => {
        if (src) {
          element.append(`<script src="${src}"></script>`, { html: true });
        } else if (content) {
          element.append(`<script type="text/javascript">${content}</script>`, {
            html: true,
          });
        }
      });
    }
  }
}

async function extractWebflowHtml(html: string) {
  const collector = new ScriptCollector();
  const rewriter = new HTMLRewriter()
    .on('script', collector)
    .on('link', collector)
    .on('style', collector)
    .on('body', collector);

  await rewriter.transform(new Response(html)).text();

  return {
    body: collector.bodyContent,
    headScripts: collector.headScripts,
    headLinks: collector.headLinks,
    bodyScripts: collector.bodyScripts,
  };
}

async function injectWebflowHtml(
  indexHtml: string,
  headScripts: { src: string | null; content: string | null }[],
  headLinks: { href: string; rel: string | null }[],
  bodyScripts: { src: string | null; content: string | null }[]
) {
  const injector = new ScriptInjector(headScripts, headLinks, bodyScripts);
  const rewriter = new HTMLRewriter().on('head', injector).on('body', injector);

  return await rewriter.transform(new Response(indexHtml)).text();
}

export default class extends WorkerEntrypoint<{
  ASSETS: Fetcher;
}> {
  override async fetch(request: Request) {
    const url = new URL(request.url);
    if (!url.pathname.startsWith('/embed') && url.pathname !== '/') {
      return this.env.ASSETS.fetch(request);
    }

    const targetPath = url.pathname.replace(/^\/embed/, '') || '/';
    const webflowURL = `${WEBFLOW_ROOT}${targetPath}`;

    const res = await fetch(webflowURL);
    if (!res.ok)
      return new Response('Failed to load Webflow page', { status: 502 });

    const webflowHtml = await res.text();
    const { headScripts, headLinks, bodyScripts } = await extractWebflowHtml(
      webflowHtml
    );

    if (url.pathname === '/') {
      const indexHtml = await this.env.ASSETS.fetch(request);
      const modifiedHtml = await injectWebflowHtml(
        await indexHtml.text(),
        headScripts,
        headLinks,
        bodyScripts
      );
      return new Response(modifiedHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      });
    } else {
      return new Response(webflowHtml, {
        headers: {
          'Content-Type': 'text/html; charset=utf-8',
          'Cache-Control': 'public, max-age=300',
        },
      });
    }
  }
}
