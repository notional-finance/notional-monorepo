import { FormattedMessage } from 'react-intl';
import { PositionDetailsTable } from '@notional-finance/trade';
import { useLiquidityDetails } from '../hooks/use-liquidity-details';

interface LiquidityDetailsTableProps {
  hideUpdatedColumn?: boolean;
}

export const LiquidityDetailsTable = ({
  hideUpdatedColumn,
}: LiquidityDetailsTableProps) => {
  const { tableData, maturity, tooRisky, onlyCurrent } = useLiquidityDetails();

  return (
    <PositionDetailsTable
      title={<FormattedMessage defaultMessage={'Position Details'} />}
      hideUpdatedColumn={hideUpdatedColumn}
      tableData={tableData}
      maturity={maturity}
      tooRisky={tooRisky}
      onlyCurrent={onlyCurrent}
    />
  );
};
