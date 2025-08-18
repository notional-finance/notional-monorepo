import { Box, styled } from '@mui/material';
import { ChartIcon } from '@notional-finance/icons';
import { Button, H2, LargeInputTextEmphasized } from '@notional-finance/mui';
import { TotalBox } from './total-box';
import {
  useAppStore,
  useCurrentTradeContext,
  useDefaultVaultAPY,
  useVaultFeeRate,
} from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { VaultPerformanceChart } from './vault-performance-chart';
import { useTheme } from '@mui/material/styles';

const DataSection = () => {
  const theme = useTheme();
  const context = useCurrentTradeContext();
  const { isMobileView, baseCurrency } = useAppStore();
  const vault = useDefaultVaultAPY(context?.vaultAddress);
  const feeRate = useVaultFeeRate(context?.vaultAddress);
  const tvlFiat = vault?.tvl?.toFiat(baseCurrency);
  const liquidityFiat = vault?.liquidity?.toFiat(baseCurrency);

  return (
    <DataSectionContainer>
      <HeaderContainer>
        {isMobileView ? (
          <LargeInputTextEmphasized>
            <FormattedMessage defaultMessage={'Vault Details'} />
          </LargeInputTextEmphasized>
        ) : (
          <H2>
            <FormattedMessage defaultMessage={'Vault Details'} />
          </H2>
        )}
        {!isMobileView && (
          <Button
            variant="contained"
            startIcon={<ChartIcon sx={{ fontSize: theme.spacing(2) }} />}
            href={'/'}
          >
            <FormattedMessage defaultMessage={'View Analytics'} />
          </Button>
        )}
      </HeaderContainer>
      <ContentContainer>
        <TotalBoxesContainer>
          <TotalBox
            key={'vault-tvl'}
            title={'Vault TVL'}
            value={tvlFiat?.toFloat()}
            decimals={0}
            prefix={tvlFiat?.fiatSymbol || '$'}
          />
          <TotalBox
            key={'borrow-liquidity'}
            title={'Borrow Liquidity'}
            value={liquidityFiat?.toFloat()}
            decimals={0}
            prefix={liquidityFiat?.fiatSymbol || '$'}
          />
          <TotalBox
            key={'fee-rate'}
            title={'Fee Rate'}
            value={feeRate}
            decimals={4}
            suffix="%"
          />
        </TotalBoxesContainer>
        <Box sx={{ width: '100%' }}>
          <VaultPerformanceChart />
        </Box>
      </ContentContainer>
    </DataSectionContainer>
  );
};

const DataSectionContainer = styled(Box)(
  ({ theme }) => `
  margin-bottom: ${theme.spacing(3)};
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
`
);

const HeaderContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-bottom: ${theme.spacing(3)};
`
);

const ContentContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: flex-start;
  width: 100%;
  gap: ${theme.spacing(3)};

  ${theme.breakpoints.down('sm')} {
    flex-direction: column;
    align-items: flex-start;
    gap: ${theme.spacing(2)};
  }
`
);

const TotalBoxesContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  gap: ${theme.spacing(3)};

  ${theme.breakpoints.down('sm')} {
    width: 100%;
    gap: ${theme.spacing(2)};
  }
`
);
export default DataSection;
