import { usePortfolioHoldings } from './use-portfolio-holdings';
import { DataTable, TABLE_VARIANTS } from '@notional-finance/mui';
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
          toggleBarProps.toggleOption === 0 && toggleBarProps.showToggle
            ? groupedHoldings
            : detailedHoldings
        }
        pendingTokenData={pendingTokenData}
        pendingMessage={
          <FormattedMessage
            defaultMessage={
              'Positions are being recalculated to reflect your last transaction'
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
        tableVariant={TABLE_VARIANTS.TOTAL_ROW}
      />
    </Box>
  );
};

export default PortfolioHoldings;
