import { Box } from '@mui/material';
import { observer } from 'mobx-react-lite';

interface RouteContainerProps {
  children: React.ReactNode | React.ReactNode[];
}

const RouteContainer = ({ children }: RouteContainerProps) => {
  return <Box height="100%">{children}</Box>;
};

export default observer(RouteContainer);
