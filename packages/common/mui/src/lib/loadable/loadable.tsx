import { lazy, Suspense } from 'react';
import { PageLoading } from '../page-loading/page-loading';

export const loadable = (importFunc: any, backgroundColor?: string) => {
  const LazyComponent = lazy(importFunc);

  return (props) => (
    <Suspense
      fallback={
        <PageLoading
          sx={{
            background: backgroundColor,
            width: '100%',
            minHeight: '100vh',
            marginTop: '400px',
            zIndex: 99999,
            top: '-72px',
            position: 'absolute',
          }}
        />
      }
    >
      <LazyComponent {...props} />
    </Suspense>
  );
};

export default loadable;
