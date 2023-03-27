import { ReactNode } from 'react';
import { useTheme, styled, Box } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { Button } from '../../button/button';
import { Card } from '../../card/card';
import { Link } from 'react-router-dom';
import {
  H4,
  CurrencyTitle,
  CardInput,
  SectionTitle,
} from '../../typography/typography';
import { PlusIcon } from '@notional-finance/icons';
import { colors } from '@notional-finance/styles';
import { Market } from '@notional-finance/sdk/src/system';
import { FormattedMessage } from 'react-intl';

export interface IncentiveVariantProps {
  symbol: string;
  rate: number;
  incentiveRate: number;
  route: string;
  buttonText: ReactNode;
}

export const Incentive = ({
  symbol,
  rate,
  incentiveRate,
  route,
  buttonText,
}: IncentiveVariantProps) => {
  const theme = useTheme();

  const formattedTotalRate = `${Market.formatInterestRate(
    rate + incentiveRate,
    2
  )} APY`;
  const formattedRate = `${Market.formatInterestRate(rate, 2)} APY`;
  const formattedIncentiveRate = `${Market.formatInterestRate(
    incentiveRate,
    2
  )} APY`;

  return (
    <Link to={route}>
      <Card height={'auto'}>
        {symbol && (
          <StyledIcon top={theme.spacing(-9)}>
            <TokenIcon symbol={symbol} size="extraLarge" />
          </StyledIcon>
        )}
        <>
          <CurrencyTitle
            accent
            textAlign="left"
            marginBottom={theme.spacing(1)}
          >
            {symbol}
          </CurrencyTitle>
          <H4 textAlign="left" marginBottom={theme.spacing(4)}>
            {formattedTotalRate}
          </H4>
          <SectionTitle textAlign="left">
            <FormattedMessage defaultMessage={'VARIABLE RATE'} />
          </SectionTitle>
          <CardInput textAlign="left" marginBottom={theme.spacing(3)}>
            {formattedRate}
          </CardInput>
          <SectionTitle textAlign="left" marginBottom={theme.spacing(1)}>
            <PlusIcon width={'9px'} />
            <FormattedMessage defaultMessage="NOTE INCENTIVE YIELD" />
          </SectionTitle>
          <CardInput textAlign="left" marginBottom={theme.spacing(3)}>
            {formattedIncentiveRate}
          </CardInput>
        </>
        <Button
          fullWidth
          size="large"
          variant="contained"
          sx={{
            textTransform: 'uppercase',
          }}
        >
          {buttonText}
        </Button>
      </Card>
    </Link>
  );
};

const StyledIcon = styled(Box)(
  ({ theme }) => `
  position: relative;
  left: ${theme.spacing(23)};
  img {
    left: 0px;
    top: ${theme.spacing(3)};
    position: absolute;
    z-index: 2;
  }
  &::after {
    position: absolute;
    content: '';
    top: ${theme.spacing(2)};
    right: 0px;
    bottom: 0px;
    left: ${theme.spacing(-1)};
    border-radius: 50%;
    border: 10px solid ${colors.white};
    padding: 34px;
    background: ${theme.palette.common.white};
    box-shadow: ${theme.shape.shadowStandard};
    z-index: 1;
    width: 0;
    height: 0;
  }
`
);

export default Incentive;
