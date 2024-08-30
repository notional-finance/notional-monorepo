import { useTheme, Box, SxProps } from '@mui/material';
import { PageLoading } from '@notional-finance/mui';
import { useAppReady } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';
interface FeatureLoaderProps {
  children: React.ReactNode[] | React.ReactNode;
  featureLoaded?: boolean;
  backgroundColor?: string;
  sx?: SxProps;
}

const FeatureLoader = ({
  children,
  featureLoaded = true,
  backgroundColor,
  sx,
}: FeatureLoaderProps) => {
  const isReady = useAppReady();
  const theme = useTheme();
  return (
    <Box>
      {isReady && featureLoaded ? (
        children
      ) : (
        <PageLoading
          sx={{
            background: backgroundColor || theme.palette.background.paper,
            width: '100%',
            height: '100vh',
            zIndex: 5,
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            ...sx,
          }}
          type="notional"
        />
      )}
    </Box>
  );
};

export default observer(FeatureLoader);
