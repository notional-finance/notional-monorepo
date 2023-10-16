import { usePortfolioHoldings } from './use-portfolio-holdings';
import { DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { TableActionRow } from '../../components';
import { Box } from '@mui/material';
import { PortfolioRisk } from './portfolio-risk';

export const PortfolioHoldings = () => {
  const {
    portfolioHoldingsColumns,
    detailedHoldings,
    toggleBarProps,
    groupedHoldings,
    pendingTokenData,
    setExpandedRows,
    initialState,
  } = usePortfolioHoldings();

  return (
    <Box>
      <PortfolioRisk />
      <DataTable
        toggleBarProps={toggleBarProps}
        data={
          toggleBarProps.toggleOption === 0 ? groupedHoldings : detailedHoldings
        }
        pendingTokenData={pendingTokenData}
        pendingMessage={
          <FormattedMessage
            defaultMessage={
              'Recalculating positions. Check back later to see your positions.'
            }
          />
        }
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
    </Box>
  );
};

export default PortfolioHoldings;
