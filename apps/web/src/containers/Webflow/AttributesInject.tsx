import { Box } from '@mui/material';
import { formatNumberAsPercentWithUndefined } from '@notional-finance/helpers';
import { useAllVaults, useAppStore } from '@notional-finance/notionable-hooks';
import { colors } from '@notional-finance/styles';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const DEBUG_MODE = false;
const CACHE_KEY = '1';

// These are initialized before any shadow dom is created
const origQSA = Document.prototype.querySelectorAll;
const origQS = Document.prototype.querySelector;
const origAdd = Document.prototype.addEventListener;
const redirectEvents = ['click', 'mouseover', 'mouseout'];

function restoreQuery() {
  Document.prototype.querySelectorAll = origQSA;
  Document.prototype.querySelector = origQS;
  Document.prototype.addEventListener = origAdd;
}

function patchQuery(hostEl: Element) {
  if (!hostEl || !hostEl.shadowRoot) {
    console.warn('withShadowQuery: host element has no open shadowRoot');
    return;
  }

  const shadow = hostEl.shadowRoot;

  // Patch querySelectorAll
  Document.prototype.querySelectorAll = function (selector: any) {
    const lightResults = Array.from(origQSA.call(this, selector));
    const shadowResults = Array.from(shadow.querySelectorAll(selector));
    if (DEBUG_MODE && selector.includes('fs-')) {
      console.log('selector', selector);
    }
    return lightResults.concat(shadowResults) as any;
  };

  // Patch querySelector
  Document.prototype.querySelector = function (selector: any) {
    return origQS.call(this, selector) || shadow.querySelector(selector);
  };

  // Redirect addEventListener to the shadow root, Webflow uses document.addEventListener for
  // for all events.
  Document.prototype.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    if (DEBUG_MODE) {
      console.log('addEventListener', type, listener, options);
    }

    if (redirectEvents.includes(type)) {
      shadow.addEventListener(type, listener, options);
    } else {
      origAdd.call(this, type, listener, options);
    }
  };

  // Redirect addEventListener to the shadow root, used for mirrorclick which uses
  // window.addEventListener to bind to click events.
  window.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    if (DEBUG_MODE) {
      console.log('addEventListener', type, listener, options);
    }

    if (type === 'click') {
      shadow.addEventListener(type, listener, options);
    } else {
      origAdd.call(this, type, listener, options);
    }
  };
}

function patchQueryAndRestart(
  shadowEl: Element,
  mountCallbacks?: (el: Element) => void
) {
  patchQuery(shadowEl);
  // We still need to set a timeout here to ensure that webflow can find
  // the necessary elements.
  setTimeout(() => {
    if ((window as any).Webflow?.require) {
      const ix2 = (window as any).Webflow.require('ix2');
      if (DEBUG_MODE) {
        const originalDispatch = ix2.store.dispatch;
        ix2.store.dispatch = function (action) {
          if (action.type !== 'IX2_ANIMATION_FRAME_CHANGED') {
            console.log('[IX2 DISPATCH]', action.type, action);
            console.log('IX2 store state:', ix2.store.getState());
          }
          return originalDispatch.call(this, action);
        };
        console.log('IX2 store state:', ix2.store.getState());
      }

      if (ix2) {
        // Restarts the ix2 session so it can bind the proper event listeners
        ix2.store.dispatch({ type: 'IX2_SESSION_STOPPED' });
        ix2.init();
      }

      if (DEBUG_MODE) {
        console.log('IX2 store state:', ix2.store.getState());
      }
    }
    (window as any).FinsweetAttributes?.modules?.list?.restart();
    (window as any).FinsweetAttributes?.modules?.mirrorclick?.restart();
    mountCallbacks?.(shadowEl);
  }, 0);
}

const useStartInject = (
  pageId: string,
  pageInstance: string,
  mountCallbacks?: (el: Element) => void
) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Ensures that the page id is set and the inject process is restarted if
  // it needs to be.
  useEffect(() => {
    // Set the page id so that webflow can mount the proper interactions
    document.documentElement.setAttribute('data-wf-page', pageId);

    (window as any).FinsweetAttributes =
      (window as any).FinsweetAttributes || [];

    (window as any).FinsweetAttributes.push([
      'inject',
      (component: any[]) => {
        // Once inject is loaded, we check first to see if the container is loaded or if it is
        // correctly referencing the right page instance. If not, we restart the inject process.
        if (component.length === 0 || component[0]?.instance !== pageInstance) {
          (window as any).FinsweetAttributes?.modules?.inject?.restart();
        }
      },
    ]);
  }, [pageId, pageInstance]);

  // Patches the querySelectorAll and querySelector methods to look into the
  // shadow dom for the proper elements and restarts ix2 and attributes once the
  // shadow dom is mounted.
  useEffect(() => {
    if (!containerRef.current) return;

    // The mutation observer receives a callback when the shadowRoot is mounted
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === 'childList' &&
          mutation.addedNodes &&
          mutation.addedNodes[0]['shadowRoot']
        ) {
          // We request an animation frame to ensure that webflow can find
          // all the elements.
          requestAnimationFrame(() => {
            patchQueryAndRestart(
              mutation.addedNodes[0] as Element,
              mountCallbacks
            );
          });
        }
      });
    });
    observer.observe(containerRef.current, { childList: true });

    return () => {
      observer.disconnect();
      restoreQuery();
      (window as any).FinsweetAttributes.push([
        'inject',
        (component: any[]) => {
          // Clears the component since we are unmounting here. If we don't then Finsweet
          // will still hold on to the reference and it will persist between page loads.
          component.length = 0;
        },
      ]);
    };
  }, [containerRef, mountCallbacks]);

  return containerRef;
};

function useListStart(afterListRendered: () => void) {
  const navigate = useNavigate();
  const [hasListRendered, setHasListRendered] = useState(false);

  useEffect(() => {
    if (hasListRendered) {
      afterListRendered();
    }
  }, [hasListRendered]);

  return useCallback(
    (shadow: Element) => {
      (window as any).FinsweetAttributes =
        (window as any).FinsweetAttributes || [];
      (window as any).FinsweetAttributes.push([
        'list',
        ([l, _]: any[]) => {
          l.cache = false;
          l.showQuery = true;
          // After the list is rendered we can update the href
          l.addHook('start', () => {
            shadow.shadowRoot?.querySelectorAll('.vault-row').forEach((e) => {
              const vaultLink = `/vault/mainnet/${e.getAttribute(
                'n-vault-address'
              )}`.toLowerCase();
              e['href'] = vaultLink;

              e.addEventListener('click', (e) => {
                e.preventDefault();
                navigate(vaultLink);
              });
            });

            setHasListRendered(true);
          });
        },
      ]);
    },
    [navigate]
  );
}

export const LandingPageInject = () => {
  const containerRef = useStartInject(
    '6807f00cedf01dce8388f197',
    'landing-page',
    () => {
      console.log('Landing page inject mounted');
    }
  );

  return (
    <Box
      ref={containerRef}
      className="body"
      fs-inject-element="target"
      fs-inject-source="/embed/"
      fs-inject-instance="landing-page"
      fs-inject-cachekey={CACHE_KEY}
    />
  );
};

export const PointsPageInject = () => {
  const onListStart = useListStart(() => {
    console.log('Points page list rendered');
  });
  const containerRef = useStartInject(
    '68825e92f8fa9c449f985a6b',
    'points-page',
    onListStart
  );

  return (
    <Box
      ref={containerRef}
      sx={{ background: colors['black'], minHeight: '80vh' }}
      className="body-2"
      fs-inject-element="target"
      fs-inject-source="/embed/points"
      fs-inject-instance="points-page"
      fs-inject-cachekey={CACHE_KEY}
    />
  );
};

export const VaultsPageInject = () => {
  const vaults = useAllVaults();
  const { baseCurrency } = useAppStore();
  const onContentLoaded = useCallback(() => {
    // Only set this text data once after the list is rendered so that the sorting engine
    // can read it
    document.querySelectorAll('.vault-row').forEach((e) => {
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
  }, [vaults, baseCurrency]);

  const onListStart = useListStart(onContentLoaded);

  const containerRef = useStartInject(
    '68433fd9a6eb09b8e396ad60',
    'vaults-page',
    onListStart
  );

  return (
    <Box
      sx={{ minHeight: '80vh' }}
      ref={containerRef}
      className="body-vault"
      fs-inject-element="target"
      fs-inject-source="/embed/vaults"
      fs-inject-instance="vaults-page"
      fs-inject-cachekey={CACHE_KEY}
    />
  );
};
