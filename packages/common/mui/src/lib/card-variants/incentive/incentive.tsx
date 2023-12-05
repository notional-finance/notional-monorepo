import { Box, styled, useTheme } from '@mui/material';
import { formatNumberAsAPY } from '@notional-finance/helpers';
import { LightningIcon, PlusIcon, TokenIcon } from '@notional-finance/icons';
import { colors } from '@notional-finance/styles';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Button } from '../../button/button';
import { Card } from '../../card/card';
import {
  CardInput,
  CurrencyTitle,
  H4,
  SectionTitle,
} from '../../typography/typography';

export interface IncentiveVariantProps {
  symbol: string;
  rate: number;
  incentiveRate: number;
  route: string;
  buttonText: ReactNode;
  titleOne?: ReactNode;
  leveraged?: boolean;
}

export const Incentive = ({
  symbol,
  rate,
  incentiveRate,
  route,
  buttonText,
  titleOne,
  leveraged,
}: IncentiveVariantProps) => {
  const theme = useTheme();
  const formattedTotalRate = formatNumberAsAPY(rate);
  const formattedRate = formatNumberAsAPY(rate - incentiveRate);
  const formattedIncentiveRate = formatNumberAsAPY(incentiveRate);

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
          {titleOne && (
            <SectionTitle textAlign="left" marginBottom={theme.spacing(1)}>
              {titleOne}
            </SectionTitle>
          )}
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            {leveraged && (
              <LightningIcon
                sx={{ height: '1.5em', marginRight: theme.spacing(1) }}
              />
            )}
            <H4
              textAlign="left"
              marginBottom={theme.spacing(4)}
              sx={{ color: formattedTotalRate.includes('-') ? colors.red : '' }}
            >
              {formattedTotalRate}
            </H4>
          </Box>

          <SectionTitle textAlign="left" marginBottom={theme.spacing(1)}>
            <FormattedMessage defaultMessage={'ORGANIC'} />
          </SectionTitle>
          <CardInput
            textAlign="left"
            marginBottom={theme.spacing(3)}
            sx={{ color: formattedRate.includes('-') ? colors.red : '' }}
          >
            {formattedRate}
          </CardInput>
          <SectionTitle textAlign="left" marginBottom={theme.spacing(1)}>
            <PlusIcon width={'9px'} />
            <FormattedMessage defaultMessage="NOTE INCENTIVE" />
          </SectionTitle>
          <CardInput
            textAlign="left"
            marginBottom={theme.spacing(3)}
            sx={{
              color: formattedIncentiveRate.includes('-') ? colors.red : '',
            }}
          >
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
