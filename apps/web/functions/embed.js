const WEBFLOW_ROOT = 'https://notionals-ultra-awesome-site.webflow.io';

export const onRequest = async (request) => {
  const url = new URL(request.url);
  const targetPath = url.pathname.replace(/^\/embed/, '') || '/';
  const webflowURL = `${WEBFLOW_ROOT}${targetPath}`;

  const res = await fetch(webflowURL);
  if (!res.ok)
    return new Response('Failed to load Webflow page', { status: 502 });

  let html = await res.text();

  // Inject base tag for relative paths
  html = html.replace(/<head>/i, `<head><base href="${WEBFLOW_ROOT}">`);

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=300',
    },
  });
};
