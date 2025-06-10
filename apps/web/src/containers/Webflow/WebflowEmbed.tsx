import { useEffect, useRef, useState } from 'react';

const WebflowEmbed = ({ path }: { path: string }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const target = `/embed/${path}`; // The proxied route via Cloudflare Worker

    fetch(target)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load Webflow page.');
        return res.text();
      })
      .then((html) => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        // // --- Inject HEAD scripts and links ---
        // const headScripts = doc.head.querySelectorAll('script');
        // const headLinks = doc.head.querySelectorAll('link, style');

        // headLinks.forEach((tag) => {
        //   if (!document.head.querySelector(`[href="${tag['href']}"]`)) {
        //     document.head.appendChild(tag.cloneNode(true));
        //   }
        // });

        // headScripts.forEach((oldScript) => {
        //   const newScript = document.createElement('script');
        //   if (oldScript.src) {
        //     newScript.src = oldScript.src;
        //   } else {
        //     newScript.textContent = oldScript.textContent;
        //   }
        //   newScript.async = false;
        //   document.head.appendChild(newScript);
        // });

        // --- Inject BODY content ---
        if (containerRef.current) {
          // Remove body scripts before setting innerHTML
          const bodyClone = doc.body.cloneNode(true) as HTMLElement;
          const bodyScripts = bodyClone.querySelectorAll('script');
          bodyScripts.forEach((s) => s.remove());

          containerRef.current.innerHTML = bodyClone.innerHTML;

          // Execute body scripts, defer execution until after the DOM is updated
          setTimeout(() => {
            doc.body.querySelectorAll('script').forEach((oldScript) => {
              const newScript = document.createElement('script');
              if (oldScript.src) {
                newScript.src = oldScript.src;
              } else {
                newScript.textContent = oldScript.textContent;
              }
              newScript.async = false;
              document.body.appendChild(newScript);
            });
          }, 0);
        }
      })
      .catch((err) => setError(err.message));
  }, [path]);

  return (
    <div>
      {error ? (
        <div style={{ color: 'red' }}>
          Error loading Webflow content: {error}
        </div>
      ) : (
        <div ref={containerRef} id="webflow-embed" className="body" />
      )}
    </div>
  );
};

export const LandingPageView = () => {
  // return (
  //   <iframe
  //     src={'https://webflow.notional.finance'}
  //     style={{
  //       width: '100%',
  //       height: '100%',
  //       border: 'none',
  //       position: 'absolute',
  //       top: 0,
  //       left: 0,
  //     }}
  //     title={'Notional Finance'}
  //     sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
  //     allow="autoplay; fullscreen"
  //   />
  // );
  return <WebflowEmbed path="" />;
};
