import React, { lazy, Suspense } from 'react';
import { PageLoading } from '@notional-finance/mui';

export const loadable = (importFunc) => {
  const LazyComponent = lazy(importFunc);

  return (props) => (
    <Suspense fallback={<PageLoading />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default loadable;
