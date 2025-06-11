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
        // Remove all the scripts from inside the body

        const scripts = doc.body.querySelectorAll('script');
        scripts.forEach((script) => {
          script.remove();
        });

        if (containerRef.current) {
          containerRef.current.innerHTML = doc.body.innerHTML;
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
  return <WebflowEmbed path="" />;
};
