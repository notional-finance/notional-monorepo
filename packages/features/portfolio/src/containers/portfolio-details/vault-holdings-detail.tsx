import { ChevronLeft } from '@mui/icons-material';
import { Box, styled, Typography, useTheme } from '@mui/material';
import { observer } from 'mobx-react-lite';
import { TokenIcon } from '@notional-finance/icons';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { Button } from '@notional-finance/mui';
import { useVaultHoldingsTable } from '@notional-finance/portfolio-feature-shell/hooks';

interface VaultHoldingsDetailProps {
  value?: ReturnType<typeof useVaultHoldingsTable>['vaultHoldingsData'][number];
}

const VaultHoldingsDetail: React.FC<VaultHoldingsDetailProps> = ({ value }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  if (!value) {
    return null;
  }

  return (
    <>
      <Container>
        <BackButtonContainer onClick={() => navigate(-1)}>
          <ChevronLeft
            sx={{
              color: theme.palette.typography.main,
            }}
          />
          <BackButton variant="link">
            <FormattedMessage id="back" defaultMessage="Back" />
          </BackButton>
        </BackButtonContainer>
        <HeaderContainer>
          <TokenContainer>
            <TokenIcon symbol={value.vault.symbol} size="xlarge" />
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                justifyContent: 'flex-start',
              }}
            >
              <Header variant="h1" sx={{ marginBottom: 0 }}>
                {value?.vault.label}
              </Header>
              <Caption variant="caption">{value?.vault.caption}</Caption>
            </Box>
          </TokenContainer>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'flex-end',
              justifyContent: 'flex-start',
            }}
          >
            <Header variant="h2" sx={{ marginBottom: 0 }}>
              {value.marketAPY}
            </Header>
          </Box>
        </HeaderContainer>

        <ContentContainer>
          <Title variant="h3">
            <FormattedMessage
              id="earningsSummary"
              defaultMessage="Earnings Summary"
            />
          </Title>
          <Row>
            <Label>
              <FormattedMessage id="amountPaid" defaultMessage="Amount Paid" />
            </Label>
            <Column>
              {typeof value.amountPaid === 'string' ? (
                <Value>{value.amountPaid}</Value>
              ) : (
                <>
                  <Value>{value.amountPaid.data?.[0]?.displayValue}</Value>
                  <Caption>{value.amountPaid.data?.[1]?.displayValue}</Caption>
                </>
              )}
            </Column>
          </Row>

          <Row>
            <Label>
              <FormattedMessage
                id="presentValue"
                defaultMessage="Present Value"
              />
            </Label>
            <Column>
              {typeof value.presentValue === 'string' ? (
                <Value>{value.presentValue}</Value>
              ) : (
                <>
                  <Value>{value.presentValue.data?.[0]?.displayValue}</Value>
                  <Caption>
                    {value.presentValue.data?.[1]?.displayValue}
                  </Caption>
                </>
              )}
            </Column>
          </Row>

          <Row>
            <Label>
              <FormattedMessage id="earnings" defaultMessage="Earnings" />
            </Label>
            <Column>
              {typeof value.totalEarnings === 'string' ? (
                <Value sx={{ color: theme.palette.primary.main }}>
                  {value.totalEarnings}
                </Value>
              ) : (
                <>
                  <Value sx={{ color: theme.palette.primary.main }}>
                    {value.totalEarnings.data?.[0]?.displayValue}
                  </Value>
                  <Caption>
                    {value.totalEarnings.data?.[1]?.displayValue}
                  </Caption>
                </>
              )}
            </Column>
          </Row>
        </ContentContainer>

        <ContentContainer>
          <Title variant="h3">
            <FormattedMessage id="details" defaultMessage="Details" />
          </Title>
          {value.actionRow.subRowData.map((row, index) => (
            <Row key={index}>
              <Label>{row.label}</Label>
              <Column>
                <Value>{row.value}</Value>
              </Column>
            </Row>
          ))}
        </ContentContainer>
      </Container>
      <ActionButtonContainer>
        {value.actionRow.buttonBarData.map((button, index) => (
          <Button key={index} variant="outlined" color="primary" fullWidth>
            {button.buttonText}
          </Button>
        ))}
      </ActionButtonContainer>
    </>
  );
};

const Container = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
});

const BackButtonContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: theme.spacing(1),
  padding: theme.spacing(1),
}));

const BackButton = styled(Typography)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  color: theme.palette.typography.main,
  fontSize: theme.typography.pxToRem(16),
  fontWeight: theme.typography.fontWeightMedium,
  lineHeight: 1.4,
  marginBottom: 0,
  textDecoration: 'none',
  textTransform: 'capitalize',
}));

export const HeaderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  padding: theme.spacing(0, 2),
  paddingBottom: theme.spacing(2),
}));

const TokenContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'flex-start',
  gap: theme.spacing(1),
}));

export const Header = styled(Typography)(({ theme, variant }) => ({
  fontSize: theme.typography.pxToRem(variant === 'h1' ? 16 : 14),
  fontWeight: theme.typography.fontWeightMedium,
  lineHeight: 1.4,
  color: theme.palette.typography.main,
  marginBottom: 0,
}));

export const Caption = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(12),
  color: theme.palette.typography.light,
  fontWeight: theme.typography.fontWeightRegular,
  lineHeight: 1.4,
  marginBottom: 0,
}));

const ContentContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(2),
  padding: theme.spacing(2),
  borderTop: `1px solid ${theme.palette.borders.paper}`,
  borderBottom: `1px solid ${theme.palette.borders.paper}`,
  background: theme.palette.background.paper,
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(12),
  fontWeight: theme.typography.fontWeightMedium,
  lineHeight: 1.4,
  letterSpacing: '1px',
  color: theme.palette.typography.light,
  marginBottom: 0,
  textTransform: 'uppercase',
}));

const Label = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
  fontWeight: theme.typography.fontWeightRegular,
  lineHeight: 1.4,
  color: theme.palette.typography.main,
  marginBottom: 0,
}));

const Value = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.pxToRem(14),
  fontWeight: theme.typography.fontWeightMedium,
  lineHeight: 1.4,
  color: theme.palette.typography.main,
  marginBottom: 0,
}));

const Row = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-between',
}));

const Column = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-end',
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

export default observer(VaultHoldingsDetail);
