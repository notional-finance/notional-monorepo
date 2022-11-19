import { RiskSlider, EmptyPortfolio } from '../../components';
import { useAccount } from '@notional-finance/notionable-hooks';
import { DataTable } from '@notional-finance/mui';
import { usePortfolioHoldingsTable } from './hooks';
import { defineMessage } from 'react-intl';
import { useYieldHoldingsTable } from './hooks/use-yield-holdings-table';
import { useRiskOverviewTable } from './hooks/use-risk-overview-table';

export const PortfolioOverview = () => {
  const { accountConnected } = useAccount();
  const {
    priceRiskData,
    interestRateRiskData,
    vaultRiskData,
    riskOverviewColumns,
  } = useRiskOverviewTable();
  const { portfolioHoldingsColumns, portfolioHoldingsData, tableLoading } =
    usePortfolioHoldingsTable();
  const { yieldHoldingsColumns, yieldHoldingsData } = useYieldHoldingsTable();
  const riskOverviewData = priceRiskData
    .concat(interestRateRiskData)
    .concat(vaultRiskData);

  return accountConnected ? (
    <>
      {/* 
        Risk slider and suggested actions are hidden for now
        <RiskSlider displaySuggestedActions showBorder />
      */}
      {riskOverviewData.length > 0 && (
        <DataTable
          data={riskOverviewData}
          columns={riskOverviewColumns}
          tableLoading={tableLoading}
          tableTitle={defineMessage({
            defaultMessage: 'Risk Overview',
            description: 'table title',
          })}
        />
      )}
      {portfolioHoldingsData.length > 0 && (
        <DataTable
          data={portfolioHoldingsData}
          columns={portfolioHoldingsColumns}
          tableLoading={tableLoading}
          tableTitle={defineMessage({
            defaultMessage: 'Loan and Liquidity Positions',
            description: 'table title',
          })}
        />
      )}
      {yieldHoldingsData.length > 0 && (
        <DataTable
          data={yieldHoldingsData}
          columns={yieldHoldingsColumns}
          tableTitle={defineMessage({
            defaultMessage: 'Yield Strategy Holdings',
            description: 'table title',
          })}
        />
      )}
    </>
  ) : (
    <EmptyPortfolio />
  );
};

export default PortfolioOverview;
