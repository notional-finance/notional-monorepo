import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, SxProps, useTheme } from '@mui/material';

interface WebflowEmbedProps {
  path: string;
  onContentLoaded?: (container: HTMLDivElement) => void;
  sx?: SxProps;
}

const WebflowEmbed = ({ path, onContentLoaded, sx }: WebflowEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Effect for loading and initializing Webflow content
  useEffect(() => {
    const target = `/embed/${path}`;
    let timeoutId: number;

    const initializeWebflow = (bodyScripts: NodeListOf<HTMLScriptElement>) => {
      // Guard against memory leak in unmount state
      if (!mountedRef.current) return;

      timeoutId = window.setTimeout(async () => {
        if (!mountedRef.current) return;

        // Loading all the body scripts will cause them to execute in their own order
        bodyScripts.forEach((s) => {
          const newScript = document.createElement('script');
          if (s.src) {
            newScript.src = s.src;
          } else {
            newScript.textContent = s.textContent;
          }
          document.body.appendChild(newScript);
        });

        // Once content is loaded and webflow is initialized, call the callback to perform
        // any custom DOM manipulation
        if (containerRef.current) {
          onContentLoaded?.(containerRef.current);
        }
      }, 0);
    };

    fetch(target)
      .then((res) => {
        if (!mountedRef.current) return;
        if (!res.ok) throw new Error('Failed to load Webflow page.');
        return res.text();
      })
      .then((html) => {
        if (!mountedRef.current || !html) return;

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const bodyScripts = doc.body.querySelectorAll('script');
        bodyScripts.forEach((s) => s.remove());

        if (containerRef.current) {
          containerRef.current.innerHTML = doc.body.innerHTML;
          initializeWebflow(bodyScripts);
        }
      })
      .catch((err) => {
        if (mountedRef.current) setError(err.message);
      });

    // Cleanup function
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [path, onContentLoaded]);

  return (
    <Box sx={sx}>
      {error ? (
        <div style={{ color: 'red' }}>Error loading content: {error}</div>
      ) : (
        <div
          ref={containerRef}
          id="webflow-embed"
          className={path === '' ? 'body' : 'body-vault'}
        />
      )}
    </Box>
  );
};

export const LandingPageView = () => {
  // This needs to be a callback to avoid re-rendering the component
  const onContentLoaded = useCallback((container: HTMLDivElement) => {
    // TODO: get this data from MobX
    const tvlElement = container.querySelector('#tvl');
    const maxUsdcApyElement = container.querySelector('#max-usdc-apy');
    const maxEthApyElement = container.querySelector('#max-eth-apy');

    if (tvlElement) tvlElement.textContent = '$95M';
    if (maxUsdcApyElement) maxUsdcApyElement.textContent = '25.0%';
    if (maxEthApyElement) maxEthApyElement.textContent = '14.0%';

    // TODO: update blog cards
  }, []);

  return <WebflowEmbed path="" onContentLoaded={onContentLoaded} />;
};

export const VaultPageView = () => {
  const theme = useTheme();
  const onContentLoaded = useCallback(() => {
    console.log('content loaded');

    if ((window as any).FinsweetAttributes) {
      // First unmount the existing process because it initialized before the DOM content
      // was loaded
      (window as any).FinsweetAttributes.destroy();
      // Re-initialize the process which will load all the attributes
      (window as any).FinsweetAttributes.load('list');
    }
  }, []);

  return (
    <WebflowEmbed
      sx={{ background: theme.palette.background.default }}
      path="/vaults"
      onContentLoaded={onContentLoaded}
    />
  );
};

export const PointsPageView = () => {
  const onContentLoaded = useCallback(() => {
    console.log('content loaded');
  }, []);

  return <WebflowEmbed path="/vaults" onContentLoaded={onContentLoaded} />;
};
