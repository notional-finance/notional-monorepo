const WEBFLOW_ROOT = 'https://webflow.notional.finance';

interface ScriptData {
  content: string | null;
  attributes: Record<string, string>;
}

class ScriptCollector {
  headScripts: ScriptData[] = [];
  headLinks: { href: string; rel: string | null }[] = [];
  headStyles: ScriptData[] = [];
  bodyScripts: ScriptData[] = [];
  private inHead = false;
  private inScriptTag = false;
  private inStyleTag = false;
  private prevText = '';

  element(element: Element) {
    if (element.tagName === 'head') {
      this.inHead = true;
    } else if (element.tagName === 'body') {
      this.inHead = false;
    } else if (element.tagName === 'script') {
      this.inScriptTag = true;
      // Collect all attributes
      const attributes: Record<string, string> = Object.fromEntries(
        Array.from(element.attributes).map((attr) => [attr[0], attr[1]])
      );
      if (this.inHead) {
        this.headScripts.push({ content: null, attributes });
      } else {
        this.bodyScripts.push({ content: null, attributes });
      }
    } else if (element.tagName === 'link') {
      const href = element.getAttribute('href');
      const rel = element.getAttribute('rel');
      if (href) {
        // Skip the favicon link
        if (href.endsWith('.ico')) return;
        this.headLinks.push({ href, rel });
      }
    } else if (element.tagName === 'style') {
      this.inStyleTag = true;
      // Collect all attributes
      const attributes: Record<string, string> = Object.fromEntries(
        Array.from(element.attributes).map((attr) => [attr[0], attr[1]])
      );
      this.headStyles.push({ content: null, attributes });
    }
  }

  text(text: Text) {
    if (this.prevText === text.text) return;
    this.prevText = text.text;

    if (this.inScriptTag) {
      if (this.inHead) {
        if (this.headScripts.length === 0) return;

        if (this.headScripts[this.headScripts.length - 1].content === null) {
          this.headScripts[this.headScripts.length - 1].content = text.text;
        } else {
          this.headScripts[this.headScripts.length - 1].content += text.text;
        }
      } else {
        if (this.bodyScripts.length === 0) return;

        if (this.bodyScripts[this.bodyScripts.length - 1].content === null) {
          this.bodyScripts[this.bodyScripts.length - 1].content = text.text;
        } else {
          this.bodyScripts[this.bodyScripts.length - 1].content += text.text;
        }
      }
    } else if (this.inStyleTag) {
      if (this.headStyles.length === 0) return;

      if (this.headStyles[this.headStyles.length - 1].content === null) {
        this.headStyles[this.headStyles.length - 1].content = text.text;
      }
    }
  }

  endTag() {
    this.inScriptTag = false;
  }
}

class ScriptInjector {
  constructor(
    private headScripts: ScriptData[],
    private headLinks: { href: string; rel: string | null }[],
    private headStyles: ScriptData[],
    private bodyScripts: ScriptData[]
  ) {}

  element(element: Element) {
    if (element.tagName === 'head') {
      // We do not inject head scripts because they are already in the index.html and they
      // are not dynamic.
      // this.headScripts.forEach(({ content, attributes }) => {
      //   const attrString = Object.entries(attributes)
      //     .map(([key, value]) => `${key}="${value}"`)
      //     .join(' ');
      //   if (content) {
      //     element.append(`<script ${attrString}>${content}</script>`, {
      //       html: true,
      //     });
      //   } else {
      //     element.append(`<script ${attrString}></script>`, { html: true });
      //   }
      // });

      // Inject body scripts to the head, these are webflow scripts and we want to make
      // sure they are ready before the rest of the page is loaded.
      this.bodyScripts.forEach(({ content, attributes }) => {
        const attrString = Object.entries(attributes)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');
        element.append(`<script ${attrString}>${content}</script>`, {
          html: true,
        });
      });
      this.headLinks.forEach(({ href, rel }) => {
        element.append(`<link href="${href}" rel="${rel || 'stylesheet'}">`, {
          html: true,
        });
      });
      this.headStyles.forEach(({ content, attributes }) => {
        const attrString = Object.entries(attributes)
          .map(([key, value]) => `${key}="${value}"`)
          .join(' ');
        element.append(`<style ${attrString}>${content}</style>`, {
          html: true,
        });
      });
    }
  }
}

async function injectWebflowHtml(
  indexHtml: string,
  headScripts: ScriptData[],
  headLinks: { href: string; rel: string | null }[],
  headStyles: ScriptData[],
  bodyScripts: ScriptData[]
) {
  const injector = new ScriptInjector(
    headScripts,
    headLinks,
    headStyles,
    bodyScripts
  );
  const rewriter = new HTMLRewriter().on('head', injector).on('body', injector);

  return await rewriter.transform(new Response(indexHtml)).text();
}

export async function extractWebflowHtml(
  webflowHtml: string,
  indexHtml: string
) {
  const collector = new ScriptCollector();
  const rewriter = new HTMLRewriter()
    .on('head', collector)
    .on('body', collector)
    .on('link', collector)
    .on('style', collector)
    .on('script', collector);

  await rewriter.transform(new Response(webflowHtml)).text();

  return await injectWebflowHtml(
    indexHtml,
    collector.headScripts,
    collector.headLinks,
    collector.headStyles,
    collector.bodyScripts
  );
}

export async function fetchWebflowPage(pathname: string, isEmbed: boolean) {
  // If pathname starts with /embed, we need to remove the /embed prefix otherwise just default to the
  // root path
  const targetPath = isEmbed ? pathname.replace(/^\/embed\//, '') : pathname;
  console.log('isEmbed', isEmbed);
  console.log('pathname', pathname);
  console.log('fetching webflow page', targetPath);
  const url = `${WEBFLOW_ROOT}/${targetPath}`;
  const res = await fetch(url);
  if (!res.ok) {
    // Just return the root page if the target page is not found
    return await fetch(WEBFLOW_ROOT).then((res) => res.text());
  }
  return await res.text();
}
