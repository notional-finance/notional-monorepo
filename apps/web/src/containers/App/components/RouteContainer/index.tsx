import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { Box } from '@mui/material';
import Plausible from 'plausible-tracker';
import { useNotionalError } from '@notional-finance/notionable-hooks';

interface RouteContainerProps {
  children: React.ReactNode | React.ReactNode[];
  onRouteChange: (path: string) => void;
}

const RouteContainer = ({ children, onRouteChange }: RouteContainerProps) => {
  const history = useHistory();
  const { error } = useNotionalError();
  const { trackPageview } = Plausible();
  const url = location.href;

  useEffect(() => {
    if (error) {
      history.push(
        `/error?code=${error.code || 500}&msgId=${error.msgId || 'unknown'}`
      );
    }
  }, [error, history]);

  useEffect(() => {
    return history.listen((location) => {
      onRouteChange(location.pathname);
      trackPageview({
        url: url,
      });
    });
  }, [history, onRouteChange]);

  return <Box height="100%">{children}</Box>;
};

export default RouteContainer;
