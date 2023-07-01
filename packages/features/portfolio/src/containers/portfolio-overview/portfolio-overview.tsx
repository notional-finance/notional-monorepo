import { EmptyPortfolio } from '../../components';
import { useAccountReady } from '@notional-finance/notionable-hooks';
import { DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useTotalHoldingsTable } from './hooks';
import { Box } from '@mui/material';
// import { useYieldHoldingsTable } from './hooks/use-yield-holdings-table';
// import { useRiskOverviewTable } from './hooks/use-risk-overview-table';

export const PortfolioOverview = () => {
  const accountConnected = useAccountReady();
  const { totalHoldingsColumns, totalHoldingsData, totalHoldingsIsLoading } =
    useTotalHoldingsTable();
  // const {
  //   priceRiskData,
  //   interestRateRiskData,
  //   vaultRiskData,
  //   riskOverviewColumns,
  // } = useRiskOverviewTable();
  // const { portfolioHoldingsColumns, portfolioHoldingsData, tableLoading } =
  //   usePortfolioHoldingsTable();
  // const { yieldHoldingsColumns, yieldHoldingsData } = useYieldHoldingsTable();
  // const riskOverviewData = priceRiskData
  //   .concat(interestRateRiskData)
  //   .concat(vaultRiskData);

  return accountConnected ? (
    <Box>
      {totalHoldingsData.length > 0 && (
        <DataTable
          data={totalHoldingsData}
          columns={totalHoldingsColumns}
          tableLoading={totalHoldingsIsLoading}
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
    // <>
    //   {/*
    //     Risk slider and suggested actions are hidden for now
    //     <RiskSlider displaySuggestedActions showBorder />
    //   */}
    //   {riskOverviewData.length > 0 && (
    //     <DataTable
    //       data={riskOverviewData}
    //       columns={riskOverviewColumns}
    //       tableLoading={tableLoading}
    //       tableTitle={
    //         <div>
    //           <FormattedMessage
    //             defaultMessage="Risk Overview"
    //             description="table title"
    //           />
    //         </div>
    //       }
    //     />
    //   )}
    //   {yieldHoldingsData.length > 0 && (
    //     <DataTable
    //       data={yieldHoldingsData}
    //       columns={yieldHoldingsColumns}
    //       tableTitle={
    //         <div>
    //           <FormattedMessage
    //             defaultMessage="Yield Strategy Holdings"
    //             description="table title"
    //           />
    //         </div>
    //       }
    //     />
    //   )}
    // </>
    <EmptyPortfolio />
  );
};

export default PortfolioOverview;
