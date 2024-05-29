import { usePortfolioHoldings } from './use-portfolio-holdings';
import { DataTable, TABLE_VARIANTS } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { TableActionRow } from '../../components';
import { Box } from '@mui/material';
import { PortfolioRisk } from './portfolio-risk';
import { useState } from 'react';
// import { useEarningsBreakdown } from './use-earnings-breakdown';
import { useLiquidationRisk } from './use-liquidation-risk';

export const PortfolioHoldings = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const {
    portfolioHoldingsColumns,
    toggleBarProps,
    portfolioHoldingsData,
    pendingTokenData,
    setExpandedRows,
    initialState,
  } = usePortfolioHoldings();
  // TODO: add this back in when we have the data
  // const { earningsBreakdownData, earningsBreakdownColumns } =
  //   useEarningsBreakdown();
  const { liquidationRiskColumns, liquidationRiskData } = useLiquidationRisk();

  const holdingsData = {
    0: {
      columns: portfolioHoldingsColumns,
      data: portfolioHoldingsData,
    },
    // 1: {
    //   columns: earningsBreakdownColumns,
    //   data: earningsBreakdownData,
    // },
    1: {
      columns: liquidationRiskColumns,
      data: liquidationRiskData,
    },
  };

  const tableTabs = [
    {
      title: <FormattedMessage defaultMessage="Positions" />,
    },
    // {
    //   title: <FormattedMessage defaultMessage="Earnings Breakdown" />,
    // },
    {
      title: <FormattedMessage defaultMessage="Liquidation Risk" />,
    },
  ];

  return (
    <Box>
      <PortfolioRisk />
      <DataTable
        tabBarProps={{
          tableTabs,
          setCurrentTab,
          currentTab,
        }}
        toggleBarProps={toggleBarProps}
        data={holdingsData[currentTab].data}
        pendingTokenData={currentTab === 0 ? pendingTokenData : []}
        pendingMessage={
          <FormattedMessage
            defaultMessage={
              'Positions are being recalculated to reflect your last transaction'
            }
          />
        }
        columns={holdingsData[currentTab].columns}
        CustomRowComponent={currentTab === 0 ? TableActionRow : undefined}
        tableTitle={
          <FormattedMessage
            defaultMessage="Portfolio Holdings"
            description="table title"
          />
        }
        initialState={initialState}
        expandableTable={true}
        setExpandedRows={setExpandedRows}
        tableVariant={TABLE_VARIANTS.TOTAL_ROW}
      />
    </Box>
  );
};

export default PortfolioHoldings;
