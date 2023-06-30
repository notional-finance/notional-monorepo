import { ReactElement } from 'react';
import { Box } from '@mui/material';
import { PageLoading } from '../page-loading/page-loading';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

interface FeatureLoaderProps {
  children: ReactElement<any, any>;
  featureLoaded?: boolean;
  backgroundColor?: string;
}

export const FeatureLoader = ({
  children,
  featureLoaded = true,
  backgroundColor,
}: FeatureLoaderProps) => {
  const selectedNetwork = useSelectedNetwork()
  return (
    <Box>
      {!!selectedNetwork && featureLoaded ? (
        children
      ) : (
        <PageLoading
          sx={{
            background: backgroundColor,
            width: '100%',
            heigh: '100%',
            minHeight: '100vh',
            zIndex: 99999,
            top: '-72px',
            position: 'relative',
          }}
        />
      )}
    </Box>
  );
};

export default FeatureLoader;
