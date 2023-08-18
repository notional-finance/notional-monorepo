import { usePortfolioHoldings } from './use-portfolio-holdings';
import { DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { TableActionRow } from '../../components';
import { usePortfolioButtonBar } from '../../hooks';
import { Box } from '@mui/material';
import { PortfolioRisk } from './portfolio-risk';

export const PortfolioHoldings = () => {
  const buttonData = usePortfolioButtonBar();
  const {
    portfolioHoldingsColumns,
    portfolioHoldingsData,
    setExpandedRows,
    initialState,
  } = usePortfolioHoldings();

  return (
    <Box>
      <PortfolioRisk />
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
    </Box>
  );
};

export default PortfolioHoldings;
