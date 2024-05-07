import { Box, styled, useTheme } from '@mui/material';
import {
  FiatSymbols,
  TokenBalance,
  TokenDefinition,
} from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';
import { Body, CountUp, LabelValue } from '@notional-finance/mui';
import { useFiat } from '@notional-finance/notionable-hooks';
import { FormattedMessage } from 'react-intl';

interface TotalEarningsProps {
  totalAtMaturity: TokenBalance | undefined;
  collateral: TokenDefinition | undefined;
}

export const TotalEarnings = ({
  totalAtMaturity,
  collateral,
}: TotalEarningsProps) => {
  const theme = useTheme();
  const baseCurrency = useFiat();
  const tokenValue = totalAtMaturity ? totalAtMaturity?.toFloat() : 0;
  const fiatValue = totalAtMaturity
    ? totalAtMaturity.toFiat(baseCurrency).toFloat()
    : 0;
  const symbol = totalAtMaturity ? ` ${totalAtMaturity.symbol}` : '';

  return (
    <Container>
      <LabelValue sx={{ display: 'flex' }}>
        <FormattedMessage
          defaultMessage={'Total at Maturity {maturity}'}
          values={{
            maturity: collateral ? (
              <Body sx={{ marginLeft: theme.spacing(1) }}>
                ({formatTokenType(collateral).caption})
              </Body>
            ) : (
              ''
            ),
          }}
        />
      </LabelValue>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'end' }}>
        <LabelValue
          sx={{
            color: theme.palette.primary.main,
            paddingBottom: theme.spacing(0.5),
          }}
        >
          <CountUp value={tokenValue} suffix={symbol} decimals={4} />
        </LabelValue>
        <LabelValue>
          <CountUp
            value={fiatValue}
            prefix={FiatSymbols[baseCurrency]}
            decimals={2}
          />
        </LabelValue>
      </Box>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: ${theme.spacing(1, 2)};
    margin-bottom: ${theme.spacing(2)};
    border-radius: ${theme.shape.borderRadius()};
    border: ${theme.shape.borderStandard};
    background: ${theme.palette.background.default};
    `
);

export default TotalEarnings;
