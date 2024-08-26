import { DataTable, TABLE_VARIANTS } from '@notional-finance/mui';
import { EmptyPortfolio, TableActionRow } from '../../components';
import { FormattedMessage } from 'react-intl';
import { useVaultHoldingsTable, useVaultRiskTable } from '../../hooks';
import { Box } from '@mui/material';
import { useState } from 'react';
import { observer } from 'mobx-react-lite';
// import { useVaultEarnings } from './use-vault-earnings';

export const PortfolioVaults = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const {
    vaultHoldingsColumns,
    vaultHoldingsData,
    setExpandedRows,
    toggleBarProps,
    initialState,
  } = useVaultHoldingsTable();
  // const { earningsBreakdownColumns, earningsBreakdownData } = useVaultEarnings(
  //   toggleBarProps.toggleOption === 0
  // );
  const { riskTableData, riskTableColumns, initialRiskState } =
    useVaultRiskTable();

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

  const holdingsData = {
    0: {
      columns: vaultHoldingsColumns,
      data: vaultHoldingsData,
      initialState,
    },
    // 1: {
    //   columns: earningsBreakdownColumns,
    //   data: earningsBreakdownData,
    // },
    1: {
      columns: riskTableColumns,
      data: riskTableData,
      initialState: initialRiskState,
    },
  };

  return (
    <Box>
      {vaultHoldingsData && vaultHoldingsData.length === 0 ? (
        <EmptyPortfolio />
      ) : (
        <DataTable
          tabBarProps={{
            tableTabs,
            setCurrentTab,
            currentTab,
          }}
          tabsThatIncludeToggle={[1]}
          data={holdingsData[currentTab].data}
          columns={holdingsData[currentTab].columns}
          CustomRowComponent={currentTab === 0 ? TableActionRow : undefined}
          toggleBarProps={toggleBarProps}
          expandableTable={true}
          tableTitle={
            <FormattedMessage
              defaultMessage="Leveraged Vaults"
              description="table title"
            />
          }
          initialState={holdingsData[currentTab].initialState}
          setExpandedRows={setExpandedRows}
          tableVariant={currentTab !== 2 ? TABLE_VARIANTS.TOTAL_ROW : undefined}
        />
      )}
    </Box>
  );
};

export default observer(PortfolioVaults);
