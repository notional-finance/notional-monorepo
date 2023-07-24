import { useState } from 'react';
import { EmptyPortfolio } from '../../components';
import { DataTable, ButtonBar, TABLE_VARIANTS } from '@notional-finance/mui';
import { TXN_HISTORY_TYPE } from '@notional-finance/shared-config';
import { useTheme } from '@mui/material';
import { colors } from '@notional-finance/styles';
import {
  useTxnHistoryTable,
  useTxnHistoryButtonBar,
  useTxnHistoryDropdowns,
} from '../../hooks';

export const PortfolioTransactionHistory = () => {
  const theme = useTheme();
  const [txnHistoryType, setTxnHistoryType] = useState<TXN_HISTORY_TYPE>(
    TXN_HISTORY_TYPE.PORTFOLIO_HOLDINGS
  );
  const buttonData = useTxnHistoryButtonBar(setTxnHistoryType, txnHistoryType);
  const { dropdownsData, currencyOptions } =
    useTxnHistoryDropdowns(TXN_HISTORY_TYPE);
  const { txnHistoryData, txnHistoryColumns } =
    useTxnHistoryTable(currencyOptions);

  return txnHistoryData && txnHistoryData.length > 0 ? (
    <>
      <ButtonBar
        buttonOptions={buttonData}
        buttonVariant="outlined"
        customButtonColor={colors.neonTurquoise}
        sx={{
          background: colors.black,
          borderRadius: theme.shape.borderRadius(),
        }}
      />
      <DataTable
        data={txnHistoryData}
        columns={txnHistoryColumns}
        filterBarData={dropdownsData}
      />
    </>
  ) : (
    <EmptyPortfolio />
  );
};

export default PortfolioTransactionHistory;
