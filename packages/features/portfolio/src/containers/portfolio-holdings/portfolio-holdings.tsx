import { useAccountReady } from '@notional-finance/notionable-hooks';
import { usePortfolioHoldings } from './use-portfolio-holdings';
import { Box } from '@mui/material';
import { DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { EmptyPortfolio } from '../../components';

export const PortfolioHoldings = () => {
  const accountConnected = useAccountReady();
  const { portfolioHoldingsColumns, portfolioHoldingsData } =
    usePortfolioHoldings();

  return accountConnected ? (
    <Box>
      {portfolioHoldingsData.length > 0 && (
        <DataTable
          data={portfolioHoldingsData}
          columns={portfolioHoldingsColumns}
          tableTitle={
            <div>
              <FormattedMessage
                defaultMessage="Portfolio Holdings"
                description="table title"
              />
            </div>
          }
        />
      )}
    </Box>
  ) : (
    <EmptyPortfolio />
  );
};

export default PortfolioHoldings;
