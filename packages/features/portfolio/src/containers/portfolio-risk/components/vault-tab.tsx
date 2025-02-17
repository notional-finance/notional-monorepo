import { observer } from 'mobx-react-lite';
import { Box, styled } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { FormattedMessage } from 'react-intl';

import { TokenIcon } from '@notional-finance/icons';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { Body, Button, Caption, H4, LabelValue } from '@notional-finance/mui';
import { useVaultRiskTable } from '@notional-finance/portfolio-feature-shell/hooks';

const VaultTab = () => {
  const theme = useTheme();
  const network = useSelectedNetwork();
  const { riskTableData } = useVaultRiskTable();

  return (
    <Container>
      <Box>
        {riskTableData.map((item) => (
          <Card>
            <TokenContainer>
              <TokenIcon
                symbol={item.vault.symbol}
                size={'xl'}
                style={{ width: 40, height: 40 }}
              />
              <Box>
                <H4>{item.vault.label}</H4>
                <Caption>{item.vault.caption}</Caption>
              </Box>
            </TokenContainer>

            <Row>
              <Body sx={{ color: theme.palette.typography.main }}>
                Health Factor
              </Body>
              <LabelValue
                sx={{
                  color: theme.palette.primary.main,
                }}
              >
                {item.healthFactor
                  ? `${item.healthFactor.toFixed(2)} / 5`
                  : '-'}
              </LabelValue>
            </Row>

            <Row>
              <Body sx={{ color: theme.palette.typography.main }}>
                Exchange Rate
              </Body>

              <Row sx={{ width: 'fit-content', gap: 1 }}>
                <TokenIcon
                  symbol={item.exchangeRate.symbol}
                  network={network}
                  size={'small'}
                  style={{ display: 'flex' }}
                />
                <LabelValue>{item.exchangeRate.label}</LabelValue>
              </Row>
            </Row>

            <Row>
              <Body sx={{ color: theme.palette.typography.main }}>
                Liquidation Price
              </Body>
              <LabelValue>{item.liquidationPrice}</LabelValue>
            </Row>

            <Row>
              <Body sx={{ color: theme.palette.typography.main }}>
                Current Price
              </Body>
              <LabelValue>{item.currentPrice}</LabelValue>
            </Row>

            <Button variant="outlined" color="primary" fullWidth>
              <FormattedMessage defaultMessage={'Manage'} />
            </Button>
          </Card>
        ))}
      </Box>
    </Container>
  );
};

const Container = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1),
  paddingTop: theme.spacing(2),
}));

const Row = styled(Box)(() => ({
  width: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
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
  padding: theme.spacing(3, 2),
  borderTop: `1px solid ${theme.palette.borders.paper}`,
  '&:last-child': {
    borderBottom: `1px solid ${theme.palette.borders.paper}`,
  },
}));

export default observer(VaultTab);
