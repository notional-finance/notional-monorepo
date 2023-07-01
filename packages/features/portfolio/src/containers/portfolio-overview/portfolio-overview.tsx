import { EmptyPortfolio } from '../../components';
import { useAccountReady } from '@notional-finance/notionable-hooks';
import { DataTable } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useTotalHoldingsTable, useVaultHoldingsTable } from './hooks';
import { Box } from '@mui/material';

export const PortfolioOverview = () => {
  const accountConnected = useAccountReady();
  const { totalHoldingsColumns, totalHoldingsData } = useTotalHoldingsTable();
  const { vaultHoldingsColumns, vaultHoldingsData } = useVaultHoldingsTable();
  // const {
  //   priceRiskData,
  //   interestRateRiskData,
  //   vaultRiskData,
  //   riskOverviewColumns,
  // } = useRiskOverviewTable();
  // const riskOverviewData = priceRiskData
  //   .concat(interestRateRiskData)
  //   .concat(vaultRiskData);

  return accountConnected ? (
    <Box>
      {totalHoldingsData.length > 0 && (
        <DataTable
          data={totalHoldingsData}
          columns={totalHoldingsColumns}
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
      {vaultHoldingsData.length > 0 && (
        <DataTable
          data={vaultHoldingsData}
          columns={vaultHoldingsColumns}
          tableTitle={
            <div>
              <FormattedMessage
                defaultMessage="Leveraged Vaults"
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
    // </>
    <EmptyPortfolio />
  );
};

export default PortfolioOverview;
