import {
  Body,
  DataTable,
  InfoTooltip,
  TABLE_VARIANTS,
} from '@notional-finance/mui';
import {
  EmptyPortfolio,
  PortfolioPageHeader,
  TableActionRow,
} from '../../components';
import { FormattedMessage } from 'react-intl';
import { useVaultHoldingsTable, useVaultRiskTable } from '../../hooks';
import { Box, useTheme } from '@mui/material';
import { useState } from 'react';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/util';
import { MultiTokenIcon } from '@notional-finance/icons';

// import { useVaultEarnings } from './use-vault-earnings';

const ClaimableRewards = ({
  rewardTokens,
  vaults,
}: {
  rewardTokens: string[];
  vaults: string[];
}) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(1),
        padding: theme.spacing(1.5),
        borderRadius: theme.spacing(6),
        backgroundColor: theme.palette.info.light,
      }}
    >
      <MultiTokenIcon symbols={rewardTokens} size={'medium'} shiftSize={8} />
      <Body main>Claimable Rewards</Body>
      <InfoTooltip
        iconColor={theme.palette.info.dark}
        iconSize={theme.spacing(2)}
        ToolTipComp={() => (
          <Box>
            {vaults.map((v) => (
              <Body key={v}>{v}</Body>
            ))}
          </Box>
        )}
      />
    </Box>
  );
};

export const PortfolioVaults = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const {
    vaultHoldingsColumns,
    vaultHoldingsData,
    setExpandedRows,
    toggleBarProps,
    initialState,
    claimableRewards,
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
      <PortfolioPageHeader category={PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS}>
        {claimableRewards && (
          <ClaimableRewards
            rewardTokens={Array.from(claimableRewards.rewardTokens.keys())}
            vaults={claimableRewards.vaults}
          />
        )}
      </PortfolioPageHeader>
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

export default PortfolioVaults;
