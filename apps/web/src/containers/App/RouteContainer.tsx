import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box } from '@mui/material';
import { useNotionalError } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';

interface RouteContainerProps {
  children: React.ReactNode | React.ReactNode[];
}

const RouteContainer = ({ children }: RouteContainerProps) => {
  const navigate = useNavigate();
  const { error } = useNotionalError();

  useEffect(() => {
    if (error) {
      navigate(
        `/error?code=${error.code || 500}&msgId=${error.msg || 'unknown'}`
      );
    }
  }, [error, navigate]);

  return <Box height="100%">{children}</Box>;
};

export default observer(RouteContainer);
