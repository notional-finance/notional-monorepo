import { usePortfolioHoldings } from './use-portfolio-holdings';
import { DataTable, TABLE_VARIANTS } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { TableActionRow } from '../../components';
import { Box } from '@mui/material';
import { PortfolioRisk } from './portfolio-risk';
import { useState } from 'react';
import { useEarningsBreakdown } from './use-earnings-breakdown';
import { useLiquidationRisk } from './use-liquidation-risk';
import {
  useAccountDefinition,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';

export const PortfolioHoldings = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const network = useSelectedNetwork();
  const {
    portfolioHoldingsColumns,
    toggleBarProps,
    portfolioHoldingsData,
    pendingTokenData,
    setExpandedRows,
    initialState,
  } = usePortfolioHoldings();
  const { earningsBreakdownData, earningsBreakdownColumns } =
    useEarningsBreakdown(toggleBarProps.toggleOption === 0);
  const account = useAccountDefinition(network);
  const {
    liquidationRiskColumns,
    liquidationRiskData,
    initialLiquidationState,
  } = useLiquidationRisk();
  const hasDebts = !!account?.balances.find(
    (t) => t.isNegative() && !t.isVaultToken
  );

  const holdingsData = {
    0: {
      columns: portfolioHoldingsColumns,
      data: portfolioHoldingsData,
      initialState,
    },
    1: {
      columns: earningsBreakdownColumns,
      data: earningsBreakdownData,
    },
    2: {
      columns: liquidationRiskColumns,
      data: liquidationRiskData,
      initialState: initialLiquidationState,
    },
  };

  const tableTabs = [
    {
      title: <FormattedMessage defaultMessage="Positions" />,
    },
    {
      title: <FormattedMessage defaultMessage="Earnings Breakdown" />,
    },
  ];

  if (hasDebts) {
    tableTabs.push({
      title: <FormattedMessage defaultMessage="Liquidation Risk" />,
    });
  }

  return (
    <Box>
      <PortfolioRisk />
      <DataTable
        tabBarProps={{
          tableTabs,
          setCurrentTab,
          currentTab,
        }}
        tabsThatIncludeToggle={[0, 1]}
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
        initialState={holdingsData[currentTab].initialState}
        expandableTable={true}
        setExpandedRows={setExpandedRows}
        tableVariant={currentTab !== 2 ? TABLE_VARIANTS.TOTAL_ROW : undefined}
      />
    </Box>
  );
};

PortfolioHoldings.whyDidYouRender = true;

export default PortfolioHoldings;
