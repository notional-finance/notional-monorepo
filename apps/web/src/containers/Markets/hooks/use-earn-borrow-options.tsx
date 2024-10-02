import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material';
import { Body } from '@notional-finance/mui';
import { useState } from 'react';

export const useEarnBorrowOptions = () => {
  const theme = useTheme();
  const [earnBorrow, setEarnBorrow] = useState<number>(0);

  const earnBorrowOptions = [
    <Body
      key="earn"
      sx={{
        width: theme.spacing(12.5),
      }}
    >
      <FormattedMessage defaultMessage="Earn" />
    </Body>,
    <Body
      key="borrow"
      sx={{
        width: theme.spacing(12.5),
      }}
    >
      <FormattedMessage defaultMessage="Borrow" />
    </Body>,
  ];

  // NOTE: the toggleKey is used in the other hooks as earnBorrowOption which is 0 or 1 for Earn or Borrow
  // This is done because the SimpleToggle component uses numbers as keys

  return {
    toggleOptions: earnBorrowOptions,
    toggleKey: earnBorrow,
    setToggleKey: setEarnBorrow,
  };
};

export default useEarnBorrowOptions;
