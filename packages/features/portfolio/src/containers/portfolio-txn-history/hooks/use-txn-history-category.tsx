import {
  useSelectedNetwork,
  useTransactionHistory,
} from '@notional-finance/notionable-hooks';
import { Body } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material';
import { useState } from 'react';

export const useTxnHistoryCategory = () => {
  const theme = useTheme();
  const [txnCategory, setTxnCategory] = useState<number>(0);
  const network = useSelectedNetwork();
  const hasVaultHoldings = !!useTransactionHistory(network).find(
    (h) => !!h.vaultName
  );
  const txnCategoryOptions = [
    <Body
      key={0}
      sx={{
        width: theme.spacing(18.75),
      }}
    >
      <FormattedMessage defaultMessage={'Portfolio Holdings'} />
    </Body>,
    <Body
      key={1}
      sx={{
        width: theme.spacing(18.75),
      }}
    >
      <FormattedMessage defaultMessage={'Leveraged Vaults'} />
    </Body>,
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
