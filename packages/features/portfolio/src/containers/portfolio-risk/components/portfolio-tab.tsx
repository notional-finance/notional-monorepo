import { Box, styled } from '@mui/material';
import {
  Body,
  Button,
  Caption,
  H4,
  H5,
  LabelValue,
  SliderRisk,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { useTheme } from '@mui/material/styles';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { TokenIcon } from '@notional-finance/icons';
import {
  useAppStore,
  usePortfolioRiskProfile,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { useLiquidationRisk } from '../../portfolio-holdings/use-liquidation-risk';

const PortfolioTab = ({ noRisk }: { noRisk?: boolean }) => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const { baseCurrency } = useAppStore();
  const profile = usePortfolioRiskProfile(network);
  const { liquidationRiskData } = useLiquidationRisk(baseCurrency);

  return (
    <>
      <Container>
        <Box sx={{ padding: theme.spacing(2) }}>
          <Header>
            <FormattedMessage defaultMessage={'Portfolio Health Factor'} />
            <InfoOutlinedIcon
              sx={{ fontSize: '16px', color: theme.palette.primary.light }}
            />
          </Header>

          <SliderRisk
            healthFactor={profile?.healthFactor || null}
            style={{
              width: '100%',
              backgroundColor: theme.palette.background.paper,
              borderRadius: '6px',
              border: `1px solid ${theme.palette.borders.paper}`,
              padding: theme.spacing(0, 2),

              marginBottom: theme.spacing(3),

              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: theme.spacing(3),
            }}
            isLabelWithColor
          />

          <Row>
            <Column>
              <H5>
                <FormattedMessage defaultMessage={'Total Collateral'} />
              </H5>
              <H4>
                {profile?.totalAssets
                  .toFiat(baseCurrency)
                  .toDisplayStringWithSymbol(2, true) || '-'}
              </H4>
            </Column>
            <Column>
              <H5>
                <FormattedMessage defaultMessage={'Total Debt'} />
              </H5>
              <H4>
                {profile?.totalDebt
                  .abs()
                  .toFiat(baseCurrency)
                  .toDisplayStringWithSymbol(2, true) || '-'}
              </H4>
            </Column>
            <Column>
              <H5>
                <FormattedMessage defaultMessage={'Loan to Value'} />
              </H5>
              <H4>
                {profile?.loanToValue
                  ? formatNumberAsPercent(profile.loanToValue, 2)
                  : '-'}
              </H4>
            </Column>
          </Row>
        </Box>

        {!noRisk && (
          <Box>
            {liquidationRiskData.map((item) => (
              <Card>
                <TokenContainer>
                  <TokenIcon symbol={item.exchangeRate.symbol} size={'xl'} />
                  <Box>
                    <H4>{item.exchangeRate.symbol}</H4>
                    <Caption>{item.exchangeRate.label}</Caption>
                  </Box>
                </TokenContainer>

                <Row>
                  <Body sx={{ color: theme.palette.typography.main }}>
                    <FormattedMessage defaultMessage={'Liquidation Price'} />
                  </Body>
                  <LabelValue>{item.liquidationPrice}</LabelValue>
                </Row>

                <Row>
                  <Body sx={{ color: theme.palette.typography.main }}>
                    <FormattedMessage defaultMessage={'Current Price'} />
                  </Body>
                  <LabelValue>{item.currentPrice}</LabelValue>
                </Row>
              </Card>
            ))}
          </Box>
        )}
      </Container>

      {!noRisk && (
        <ActionButtonContainer>
          <Button variant="outlined" color="primary" fullWidth>
            <FormattedMessage defaultMessage={'Reduce Risk'} />
          </Button>
        </ActionButtonContainer>
      )}
    </>
  );
};

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const Header = styled(H4)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(1),
}));

const Row = styled(Box)(() => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
}));

const Column = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
}));

const TokenContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  flexDirection: 'row',
  gap: theme.spacing(1),
}));

const Card = styled(Box)(({ theme }) => ({
  width: '100%',
  display: 'flex',
  alignItems: 'flex-start',
  flexDirection: 'column',
  gap: theme.spacing(2),
  background: theme.palette.background.paper,
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.borders.paper}`,
  '&:last-child': {
    borderBottom: `1px solid ${theme.palette.borders.paper}`,
  },
}));

const ActionButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
  padding: theme.spacing(1, 2),
  position: 'fixed',
  bottom: 80,
  left: 0,
  right: 0,
  background: theme.palette.background.paper,
  gap: theme.spacing(2),
  zIndex: 1000,
  borderBottom: `1px solid ${theme.palette.borders.paper}`,
  boxShadow: '0px -10px 20px -10px rgba(20, 42, 74, 0.20)',
}));

export default PortfolioTab;
