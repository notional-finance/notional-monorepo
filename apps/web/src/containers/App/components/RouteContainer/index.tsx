import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Box } from '@mui/material';
import {
  useNotionalContext,
  useNotionalError,
} from '@notional-finance/notionable-hooks';
import { usePageTracking } from '@notional-finance/helpers';

interface RouteContainerProps {
  children: React.ReactNode | React.ReactNode[];
}

const RouteContainer = ({ children }: RouteContainerProps) => {
  const history = useHistory();
  const { error } = useNotionalError();
  const {
    globalState: { selectedNetwork },
  } = useNotionalContext();
  usePageTracking(selectedNetwork);

  useEffect(() => {
    if (error) {
      history.push(
        `/error?code=${error.code || 500}&msgId=${error.msg || 'unknown'}`
      );
    }
  }, [error, history]);

  return <Box height="100%">{children}</Box>;
};

export default RouteContainer;
