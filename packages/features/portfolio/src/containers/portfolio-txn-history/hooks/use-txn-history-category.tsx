import {
  useSelectedNetwork,
  useTransactionHistory,
} from '@notional-finance/notionable-hooks';

import { FormattedMessage } from 'react-intl';
import { Box } from '@mui/material';
import { useState } from 'react';

export const useTxnHistoryCategory = () => {
  const [txnCategory, setTxnCategory] = useState<number>(0);
  const network = useSelectedNetwork();
  const hasVaultHoldings = !!useTransactionHistory(network).find(
    (h) => !!h.vaultName
  );
  const txnCategoryOptions = [
    <Box
      sx={{
        fontSize: '14px',
        width: '150px',
      }}
    >
      <FormattedMessage defaultMessage={'Portfolio Holdings'} />
    </Box>,
    <Box
      sx={{
        fontSize: '14px',
        width: '150px',
      }}
    >
      <FormattedMessage defaultMessage={'Leveraged Vaults'} />
    </Box>,
  ];
  return hasVaultHoldings
    ? {
        toggleOptions: txnCategoryOptions,
        toggleKey: txnCategory,
        setToggleKey: setTxnCategory,
      }
    : undefined;
};

export default useTxnHistoryCategory;
