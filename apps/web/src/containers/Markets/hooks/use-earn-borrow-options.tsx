import { FormattedMessage } from 'react-intl';
import { Box } from '@mui/material';
import { useState } from 'react';

export const useEarnBorrowOptions = () => {
  const [earnBorrow, setEarnBorrow] = useState<number>(0);

  const earnBorrowOptions = [
    <Box
      sx={{
        fontSize: '14px',
        width: '100px',
      }}
    >
      <FormattedMessage defaultMessage="Earn" />
    </Box>,
    <Box
      sx={{
        fontSize: '14px',
        width: '100px',
      }}
    >
      <FormattedMessage defaultMessage="Borrow" />
    </Box>,
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
