import { useEffect, useRef, useState } from 'react';

const WebflowEmbed = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const target = `/embed/`; // The proxied route via Cloudflare Worker

    fetch(target)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load Webflow page.');
        return res.text();
      })
      .then((html) => {
        if (containerRef.current) {
          containerRef.current.innerHTML = html;

          // Optionally initialize Webflow interactions if script is loaded
          if ((window as any).Webflow && (window as any).Webflow.require) {
            try {
              (window as any).Webflow.ready();
              (window as any).Webflow.require('ix2').init();
            } catch (e) {
              console.warn('Webflow init failed', e);
            }
          }
        }
      })
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      {error ? (
        <div style={{ color: 'red' }}>
          Error loading Webflow content: {error}
        </div>
      ) : (
        <div ref={containerRef} id="webflow-embed" />
      )}
    </div>
  );
};

export default WebflowEmbed;
