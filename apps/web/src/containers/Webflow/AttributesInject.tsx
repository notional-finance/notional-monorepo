import { Box } from '@mui/material';
import { useEffect, useRef } from 'react';

// These are initialized before any shadow dom is created
const origQSA = Document.prototype.querySelectorAll;
const origQS = Document.prototype.querySelector;

function restoreQuery() {
  Document.prototype.querySelectorAll = origQSA;
  Document.prototype.querySelector = origQS;
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
    // console.log('selector', selector);
    // console.log('lightResults', lightResults);
    // console.log('shadowResults', shadowResults);
    return lightResults.concat(shadowResults) as any;
  };

  // Patch querySelector
  Document.prototype.querySelector = function (selector: any) {
    return origQS.call(this, selector) || shadow.querySelector(selector);
  };
}

function patchQueryAndRestart(shadowEl: Element) {
  patchQuery(shadowEl);
  setTimeout(() => {
    if ((window as any).Webflow?.require) {
      const ix2 = (window as any).Webflow.require('ix2');
      // const originalDispatch = ix2.store.dispatch;
      // ix2.store.dispatch = function (action) {
      //   if (action.type !== 'IX2_ANIMATION_FRAME_CHANGED') {
      //     console.log('[IX2 DISPATCH]', action.type, action);
      //     console.log('IX2 store state:', ix2.store.getState());
      //   }
      //   return originalDispatch.call(this, action);
      // };
      console.log('IX2 store state:', ix2.store.getState());
      if (ix2) {
        ix2.store.dispatch({ type: 'IX2_SESSION_STOPPED' });
        ix2.init();
      }
      console.log('IX2 store state:', ix2.store.getState());
    }
    (window as any).FinsweetAttributes?.modules?.list?.restart();
    (window as any).FinsweetAttributes?.modules?.mirrorclick?.restart();
  }, 0);
}

const useStartInject = (pageId: string) => {
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
        console.log('inject loaded', component);
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
              console.log('inject loaded on callback', component);
              patchQueryAndRestart(component[0]);
            },
          ]);
        } else if (component.length === 1) {
          patchQueryAndRestart(component[0]);
        }
      },
    ]);

    return () => {
      console.log('on unmount');
      (window as any).FinsweetAttributes.push([
        'inject',
        (component: any[]) => {
          console.log('removing components', component);
          component.slice(0, 0);
        },
      ]);
      // Need to remove the component from the inject process.
      // Need to un-patch the query selector
      restoreQuery();
    };
  }, [containerRef]);

  return containerRef;
};

export const LandingPageInject = () => {
  const containerRef = useStartInject('6807f00cedf01dce8388f197');

  return (
    <Box
      ref={containerRef}
      className="body"
      fs-inject-element="target"
      fs-inject-source="/embed/"
      fs-inject-instance="landing-page"
    />
  );
};

export const PointsPageInject = () => {
  const containerRef = useStartInject('68825e92f8fa9c449f985a6b');

  return (
    <Box
      ref={containerRef}
      className="body-2"
      fs-inject-element="target"
      fs-inject-source="/embed/points"
      fs-inject-instance="points-page"
    />
  );
};

export const VaultsPageInject = () => {
  const containerRef = useStartInject('68433fd9a6eb09b8e396ad60');

  return (
    <Box
      ref={containerRef}
      className="body-vault"
      fs-inject-element="target"
      fs-inject-source="/embed/vaults"
      fs-inject-instance="vaults-page"
    />
  );
};
