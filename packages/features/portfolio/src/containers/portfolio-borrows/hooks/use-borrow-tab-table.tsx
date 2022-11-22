import { useState } from 'react';
import { Box } from '@mui/material';
import { RiskSlider } from '../../../components';
import { usePortfolioButtonBar } from '../../../hooks';
import { useBorrowCapacityTable } from './use-borrow-capacity-table';
import { usePriceRiskTable } from './use-price-risk-table';
import { useInterestRateRiskTable } from '@notional-finance/risk';
import { ButtonBar } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';

export const useBorrowTabTable = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const borrowCapacity = useBorrowCapacityTable();
  const priceRiskTable = usePriceRiskTable();
  const interestRateRisk = useInterestRateRiskTable();
  const { buttonData } = usePortfolioButtonBar();

  const tableTabs = [
    { title: <FormattedMessage defaultMessage="Risk Overview" /> },
    { title: <FormattedMessage defaultMessage="Borrow Capacity" /> },
  ];

  if (priceRiskTable.tableData.length > 0) {
    tableTabs.push({ title: <FormattedMessage defaultMessage="Price Risk" /> });
  }

  if (interestRateRisk.tableData.length > 0) {
    tableTabs.push({
      title: <FormattedMessage defaultMessage="Interest Rate Risk" />,
    });
  }

  const TabComponent = () => {
    return (
      <Box>
        <RiskSlider />
        <ButtonBar
          sx={{ paddingLeft: '32px', paddingBottom: '32px' }}
          buttonVariant="outlined"
          buttonOptions={buttonData}
        />
      </Box>
    );
  };

  let tableData: any[] = [];
  let tableColumns: any[] = [];
  if (currentTab === 1) {
    tableData = borrowCapacity.tableData;
    tableColumns = borrowCapacity.tableColumns;
  } else if (currentTab === 2 && priceRiskTable.tableData.length > 0) {
    tableData = priceRiskTable.tableData;
    tableColumns = priceRiskTable.tableColumns;
  } else if (currentTab === 2 && interestRateRisk.tableData.length > 0) {
    // It's possible that the price risk table does not exist so in that
    // case the interest rate risk table is in the second position
    tableData = interestRateRisk.tableData;
    tableColumns = interestRateRisk.tableColumns;
  } else if (currentTab === 3) {
    tableData = interestRateRisk.tableData;
    tableColumns = interestRateRisk.tableColumns;
  }

  return {
    tableData: tableData,
    tableColumns: tableColumns,
    CustomTabComponent: TabComponent,
    // FIXME: this is named weird...
    isTabComponentVisible: tableData.length === 0,
    tabBarProps: {
      tableTabs,
      setCurrentTab,
      currentTab,
    },
  };
};
