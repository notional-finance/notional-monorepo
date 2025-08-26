import { useCallback, useEffect, useRef, useState } from 'react';
import { Box, SxProps, useTheme } from '@mui/material';
import { useAllVaults, useAppStore } from '@notional-finance/notionable-hooks';
import { formatNumberAsPercentWithUndefined } from '@notional-finance/helpers';
import { observer } from 'mobx-react-lite';
import { PageLoading } from '@notional-finance/mui';
import { colors } from '@notional-finance/styles';

interface WebflowEmbedProps {
  path: string;
  bodyClass: string;
  onContentLoaded?: (container: HTMLDivElement) => void;
  sx?: SxProps;
}

const WebflowEmbed = ({
  path,
  onContentLoaded,
  sx,
  bodyClass,
}: WebflowEmbedProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      // Remove all the webflow style sheets
      document
        .querySelectorAll('link[data-is-webflow="true"]')
        .forEach((link) => link.remove());
    };
  }, []);

  // Effect for loading and initializing Webflow content
  useEffect(() => {
    const target = `/embed/${path}`;
    let timeoutId: number;

    const initializeWebflow = (
      bodyScripts: NodeListOf<HTMLScriptElement>,
      headLinks: NodeListOf<HTMLLinkElement>
    ) => {
      // Guard against memory leak in unmount state
      if (!mountedRef.current) return;
      headLinks.forEach((l) => {
        const newLink = document.createElement('link');
        newLink.setAttribute('data-is-webflow', 'true');
        newLink.rel = l.rel;
        newLink.href = l.href;
        document.head.appendChild(newLink);
      });

      // Loading all the body scripts will cause them to execute in their own order
      // async
      bodyScripts.forEach((s) => {
        const newScript = document.createElement('script');
        newScript.setAttribute('data-is-webflow', 'true');
        if (s.src) {
          newScript.src = s.src;
        } else {
          newScript.textContent = s.textContent;
        }
        try {
          document.body.appendChild(newScript);
        } catch (e) {
          console.error('Error appending script', e);
          console.log('script', newScript);
        }
      });

      timeoutId = window.setTimeout(async () => {
        if (!mountedRef.current) return;

        if ((window as any).Webflow) {
          (window as any).Webflow = (window as any).Webflow || [];
          // This runs after Webflow is fully initialized
          (window as any).Webflow.push(() => {
            if (containerRef.current) {
              onContentLoaded?.(containerRef.current);
            }
          });

          // Re-initialize ix2 if it exists to ensure that everything is triggered
          // properly
          if ((window as any).Webflow?.require) {
            const ix2 = (window as any).Webflow.require('ix2');
            if (ix2) {
              ix2.store.dispatch({ type: 'IX2_SESSION_STOPPED' });
              ix2.init();
            }
          }
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
        const headLinks = doc.head.querySelectorAll<HTMLLinkElement>(
          'link[rel="stylesheet"]'
        );
        const pageId = doc.documentElement.getAttribute('data-wf-page');
        bodyScripts.forEach((s) => s.remove());
        headLinks.forEach((l) => l.remove());
        if (pageId) {
          // This ensures that all the correct event listeners are triggered
          document.documentElement.setAttribute('data-wf-page', pageId);
        }

        if (containerRef.current) {
          containerRef.current.innerHTML = doc.body.innerHTML;
          initializeWebflow(bodyScripts, headLinks);
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
        <div ref={containerRef} id="webflow-embed" className={bodyClass} />
      )}
    </Box>
  );
};

// Initializes FinsweetAttributes if used on that page
function initializeAttributes(onStart: () => void) {
  if ((window as any).FinsweetAttributes) {
    // First unmount the existing process because it initialized before the DOM content
    // was loaded
    (window as any).FinsweetAttributes.destroy();
    (window as any).FinsweetAttributes =
      (window as any).FinsweetAttributes || [];
    (window as any).FinsweetAttributes.push([
      'list',
      ([l, _]: any[]) => {
        l.cache = false;
        l.showQuery = true;
        // After the list is rendered we can update the href
        l.addHook('start', onStart);
      },
    ]);

    // Re-initialize the process which will load all the attributes
    (window as any).FinsweetAttributes.load('list');
  }
}

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

  return (
    <WebflowEmbed bodyClass="body" path="" onContentLoaded={onContentLoaded} />
  );
};

export const VaultPageView = observer(() => {
  const theme = useTheme();
  const vaults = useAllVaults();
  const { baseCurrency } = useAppStore();

  const onContentLoaded = useCallback((container: HTMLDivElement) => {
    initializeAttributes(() => {
      container.querySelectorAll('.vault-row').forEach((e) => {
        // TODO: add the network inside the cms
        // TODO: prevent default on the modal pop ups
        e['href'] = `/vault/mainnet/${e.getAttribute(
          'n-vault-address'
        )}`.toLowerCase();
      });
    });

    // Only set this text data once after the list is rendered so that the sorting engine
    // can read it
    container.querySelectorAll('.vault-row').forEach((e) => {
      const trigger = e.querySelector('.project-trigger');
      if (trigger) {
        trigger.addEventListener('click', (e) => {
          e.preventDefault();
        });
      }

      const vaultAddress = e.getAttribute('n-vault-address')?.toLowerCase();
      const vault = vaults.find(
        (v) => v.vaultConfig.vaultAddress.toLowerCase() === vaultAddress
      );
      if (!vault) return;

      const maxApyEl = e.querySelector('.vault-max-apy');
      if (maxApyEl)
        maxApyEl.textContent = formatNumberAsPercentWithUndefined(
          vault?.apy?.totalAPY,
          '-'
        );
      const liquidityEl = e.querySelector('.vault-liquidity');
      if (liquidityEl)
        liquidityEl.textContent =
          vault?.liquidity
            ?.toFiat(baseCurrency)
            .toDisplayStringWithSymbol(2, true, false) || '-';
      const tvlEl = e.querySelector('.vault-tvl');
      if (tvlEl)
        tvlEl.textContent =
          vault?.tvl
            ?.toFiat(baseCurrency)
            .toDisplayStringWithSymbol(2, true, false) || '-';
    });
  }, []);

  return vaults.length > 0 ? (
    <WebflowEmbed
      bodyClass="body-vault"
      sx={{ background: theme.palette.background.default }}
      path="/vaults"
      onContentLoaded={onContentLoaded}
    />
  ) : (
    <PageLoading type="notional" />
  );
});

export const PointsPageView = () => {
  const onContentLoaded = useCallback(() => {
    console.log('content loaded');
  }, []);

  return (
    <WebflowEmbed
      bodyClass="body-2"
      sx={{ background: colors['black'] }}
      path="/points"
      onContentLoaded={onContentLoaded}
    />
  );
};
