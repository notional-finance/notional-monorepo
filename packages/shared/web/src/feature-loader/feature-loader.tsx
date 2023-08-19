import { Box } from '@mui/material';
import { PageLoading } from '@notional-finance/mui';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';

interface FeatureLoaderProps {
  children: React.ReactNode[] | React.ReactNode;
  featureLoaded?: boolean;
  backgroundColor?: string;
}

export const FeatureLoader = ({
  children,
  featureLoaded = true,
  backgroundColor,
}: FeatureLoaderProps) => {
  const selectedNetwork = useSelectedNetwork();
  return (
    <Box>
      {!!selectedNetwork && featureLoaded ? (
        children
      ) : (
        <PageLoading
          sx={{
            background: backgroundColor,
            width: '100%',
            height: '100vh',
            zIndex: 5,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          type="notional"
        />
      )}
    </Box>
  );
};

export default FeatureLoader;
