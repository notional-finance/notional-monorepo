import { styled, Box } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { DataTable, Button } from '@notional-finance/mui';
import { EmptyPortfolio } from '../../components';
import { useLiquidityOverviewTable } from './hooks';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { Link, useParams } from 'react-router-dom';

export const PortfolioLiquidity = () => {
  const { category } = useParams<PortfolioParams>();
  const {
    liquidityOverviewData,
    liquidityOverviewColumns,
    initialState,
    setExpandedRows,
  } = useLiquidityOverviewTable();

  const RedeemNTokenButton = ({
    row,
  }: {
    row: { original: typeof liquidityOverviewData[number] };
  }) => {
    const { original } = row;
    return (
      <Box sx={{ padding: '24px' }}>
        <Link
          to={`/portfolio/${category}/${PORTFOLIO_ACTIONS.REDEEM_NTOKEN}?symbol=${original.nTokenSymbol}`}
        >
          <CustomButton>
            <FormattedMessage defaultMessage={'Redeem nTokens'} />
          </CustomButton>
        </Link>
      </Box>
    );
  };

  return liquidityOverviewData.length ? (
    <DataTable
      data={liquidityOverviewData}
      columns={liquidityOverviewColumns}
      CustomRowComponent={RedeemNTokenButton}
      initialState={initialState}
      setExpandedRows={setExpandedRows}
    />
  ) : (
    <EmptyPortfolio />
  );
};

const CustomButton = styled(Button)`
  padding: 20px 64px;
  font-size: 16px;
  text-transform: none;
`;

export default PortfolioLiquidity;
