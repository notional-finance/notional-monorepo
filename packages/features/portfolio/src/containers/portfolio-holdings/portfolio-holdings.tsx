import { useAccountReady } from '@notional-finance/notionable-hooks';
import { usePortfolioHoldings } from './use-portfolio-holdings';
import { Box } from '@mui/material';
import { DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { EmptyPortfolio, TableActionRow } from '../../components';
import { usePortfolioButtonBar } from '../../hooks';

export const PortfolioHoldings = () => {
  const accountConnected = useAccountReady();
  const buttonData = usePortfolioButtonBar();
  const {
    portfolioHoldingsColumns,
    portfolioHoldingsData,
    setExpandedRows,
    initialState,
  } = usePortfolioHoldings();

  return accountConnected ? (
    <Box>
      {portfolioHoldingsData.length > 0 && (
        <DataTable
          data={portfolioHoldingsData}
          columns={portfolioHoldingsColumns}
          CustomRowComponent={TableActionRow}
          tableTitle={
            <FormattedMessage
              defaultMessage="Portfolio Holdings"
              description="table title"
            />
          }
          tableTitleButtons={buttonData}
          initialState={initialState}
          setExpandedRows={setExpandedRows}
        />
      )}
    </Box>
  ) : (
    <EmptyPortfolio />
  );
};

export default PortfolioHoldings;
