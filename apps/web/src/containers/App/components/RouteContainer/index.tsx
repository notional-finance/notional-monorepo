import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Box } from '@mui/material';
import { useNotionalError } from '@notional-finance/notionable-hooks';

interface RouteContainerProps {
  children: React.ReactNode | React.ReactNode[];
}

const RouteContainer = ({ children }: RouteContainerProps) => {
  const history = useHistory();
  const { error } = useNotionalError();

  useEffect(() => {
    if (error) {
      history.push(
        `/error?code=${error.code || 500}&msgId=${error.msgId || 'unknown'}`
      );
    }
  }, [error, history]);

  return <Box height="100%">{children}</Box>;
};

export default RouteContainer;
