import { useAccountReady } from '@notional-finance/notionable-hooks';
import { usePortfolioHoldings } from './use-portfolio-holdings';
import { Box } from '@mui/material';
import { DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { EmptyPortfolio, TableActionRow } from '../../components';

export const PortfolioHoldings = () => {
  const accountConnected = useAccountReady();
  const {
    portfolioHoldingsColumns,
    portfolioHoldingsData,
    setExpandedRows,
    initialState,
  } = usePortfolioHoldings();

  console.log({ portfolioHoldingsData });

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
