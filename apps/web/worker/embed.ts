const WEBFLOW_ROOT = 'https://webflow.notional.finance';

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
        // Skip the favicon link
        if (href.endsWith('.ico')) return;
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

export async function extractWebflowHtml(
  webflowHtml: string,
  indexHtml: string
) {
  const collector = new ScriptCollector();
  const rewriter = new HTMLRewriter()
    .on('script', collector)
    .on('link', collector)
    .on('style', collector)
    .on('body', collector);

  await rewriter.transform(new Response(webflowHtml)).text();

  return await injectWebflowHtml(
    indexHtml,
    collector.headScripts,
    collector.headLinks,
    collector.bodyScripts
  );
}

export async function fetchWebflowPage(pathname: string) {
  // If pathname starts with /embed, we need to remove the /embed prefix otherwise just default to the
  // root path
  const isEmbed = pathname.startsWith('/embed');
  const targetPath = isEmbed ? pathname.replace(/^\/embed/, '') : '/';
  const url = `${WEBFLOW_ROOT}${targetPath}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load Webflow page: ${url}`);
  return { webflowHtml: await res.text(), isEmbed };
}
