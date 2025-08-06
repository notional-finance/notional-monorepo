import { Box, styled } from '@mui/material';
import { ChartIcon } from '@notional-finance/icons';
import { Button, H2, LargeInputTextEmphasized } from '@notional-finance/mui';
import { TotalBox } from './total-box';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';
import { VaultPerformanceChart } from './vault-performance-chart';

const DataSection = () => {
  const { isMobileView } = useAppStore();
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
            startIcon={<ChartIcon sx={{ fontSize: '16px' }} />}
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
            value={10_000_000}
            decimals={0}
            prefix="$"
          />
          <TotalBox
            key={'borrow-liquidity'}
            title={'Borrow Liquidity'}
            value={8_000_000}
            decimals={0}
            prefix="$"
          />
          <TotalBox
            key={'fee-rate'}
            title={'Fee Rate'}
            value={0.05}
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
