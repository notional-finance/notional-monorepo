import { Box } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { useEffect, useRef } from 'react';
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
      console.log('lightResults', lightResults);
      console.log('shadowResults', shadowResults);
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
  mountCallbacks: (el: Element) => void
) {
  patchQuery(shadowEl);
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
    mountCallbacks(shadowEl);
  }, 0);
}

const useStartInject = (
  pageId: string,
  mountCallbacks: (el: Element) => void
) => {
  const containerRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    // Set the page id so that webflow can mount the proper interactions
    document.documentElement.setAttribute('data-wf-page', pageId);
  }, [pageId]);

  useEffect(() => {
    (window as any).FinsweetAttributes =
      (window as any).FinsweetAttributes || [];

    (window as any).FinsweetAttributes.push([
      'inject',
      (component: any[]) => {
        if (DEBUG_MODE) {
          console.log('inject loaded', component);
        }
        // Once inject is loaded, we check first to see if the container has any children. If it doesn't
        // then we trigger the inject process which will mount a shadow dom at the containerRef
        if (containerRef.current?.children.length === 0) {
          (window as any).FinsweetAttributes?.modules?.inject?.restart();

          // This mounts a second callback that will trigger once the dom is injected that
          // will patch the querySelectorAll and querySelector methods to look into the
          // shadow dom for the proper elements and restart ix2 and attributes.
          (window as any).FinsweetAttributes.push([
            'inject',
            (component: any[]) => {
              if (DEBUG_MODE) {
                console.log('inject loaded on callback', component);
              }
              patchQueryAndRestart(component[0], mountCallbacks);
            },
          ]);
        } else if (component.length === 1) {
          patchQueryAndRestart(component[0], mountCallbacks);
        }
      },
    ]);

    return () => {
      // Need to un-patch the all the document methods
      restoreQuery();
    };
  }, [containerRef]);

  return containerRef;
};

export const LandingPageInject = () => {
  const containerRef = useStartInject('6807f00cedf01dce8388f197', () => {
    console.log('Landing page inject mounted');
  });

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
  const rewriteLinks = (shadow: Element) => {
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
            e['href'] = `/vault/mainnet/${e.getAttribute(
              'n-vault-address'
            )}`.toLowerCase();
          });
        });
      },
    ]);
  };
  const containerRef = useStartInject('68825e92f8fa9c449f985a6b', rewriteLinks);

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
  const navigate = useNavigate();

  const rewriteLinks = (shadow: Element) => {
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
        });
      },
    ]);
  };
  const containerRef = useStartInject('68433fd9a6eb09b8e396ad60', rewriteLinks);

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
