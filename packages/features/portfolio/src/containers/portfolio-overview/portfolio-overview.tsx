import { RiskSlider, EmptyPortfolio } from '../../components';
import { useAccount } from '@notional-finance/notionable-hooks';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/shared-config';
import { DataTable } from '@notional-finance/mui';
import { usePortfolioHoldingsTable } from './hooks';
import { defineMessage } from 'react-intl';
import { useYieldHoldingsTable } from './hooks/use-yield-holdings-table';

export const PortfolioOverview = () => {
  const { accountConnected } = useAccount();
  const { portfolioHoldingsColumns, portfolioHoldingsData, tableLoading } =
    usePortfolioHoldingsTable();
  const { yieldHoldingsColumns, yieldHoldingsData } = useYieldHoldingsTable();

  return accountConnected ? (
    <>
      <RiskSlider displaySuggestedActions showBorder />
      {portfolioHoldingsData.length > 0 && (
        <DataTable
          data={portfolioHoldingsData}
          columns={portfolioHoldingsColumns}
          tableLoading={tableLoading}
          tableTitle={defineMessage({
            defaultMessage: 'Portfolio Holdings',
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
