import { useState } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { LightningIcon, TokenIcon } from '@notional-finance/icons';
import { colors } from '@notional-finance/styles';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { Button } from '../../button/button';
import { Card } from '../../card/card';
import {
  CardValue,
  ContentWrapper,
} from '../incentive-leveraged/incentive-leveraged';
import { CurrencyTitle, H4, SectionTitle } from '../../typography/typography';
import { useIncentiveData } from '../use-incentive-data';

export interface IncentiveVariantProps {
  symbol: string;
  rate: number;
  route: string;
  buttonText: ReactNode;
  titleOne?: ReactNode;
  leveraged?: boolean;
  incentiveData?: {
    symbol: string;
    incentiveAPY: number;
  };
  secondaryIncentiveData?: {
    symbol: string;
    incentiveAPY: number;
  };
}

export const Incentive = ({
  symbol,
  rate,
  incentiveData,
  secondaryIncentiveData,
  route,
  buttonText,
  titleOne,
  leveraged,
}: IncentiveVariantProps) => {
  const theme = useTheme();
  const [hovered, setHovered] = useState(false);
  const {
    formattedTotalRate,
    formattedRate,
    incentiveApy,
    secondaryIncentiveApy,
    totalIncentivesApy,
  } = useIncentiveData(rate, 0, incentiveData, secondaryIncentiveData);

  return (
    <Link to={route}>
      <Card
        height={'auto'}
        onMouseOver={() => setHovered(true)}
        onMouseOut={() => setHovered(false)}
      >
        {symbol && (
          <StyledIcon top={theme.spacing(-9)}>
            <TokenIcon symbol={symbol} size="extraLarge" />
          </StyledIcon>
        )}
        <Box
          sx={{
            overflow: 'hidden',
            marginBottom: theme.spacing(2),
          }}
        >
          <CurrencyTitle
            accent
            textAlign="left"
            sx={{ marginBottom: theme.spacing(1) }}
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
              sx={{
                marginTop: theme.spacing(2),
                color: formattedTotalRate.includes('-') ? colors.red : '',
              }}
            >
              {formattedTotalRate}
            </H4>
          </Box>
          <ContentWrapper
            hovered={hovered && secondaryIncentiveData ? true : false}
            theme={theme}
          >
            <Box>
              {incentiveData && (
                <CardValue
                  title={
                    <FormattedMessage
                      defaultMessage="{symbol} INCENTIVE"
                      values={{
                        symbol: incentiveData.symbol,
                      }}
                    />
                  }
                  rate={incentiveApy}
                  symbol={incentiveData.symbol}
                  isIncentive
                />
              )}
              {secondaryIncentiveData && (
                <CardValue
                  title={
                    <FormattedMessage
                      defaultMessage="{symbol} INCENTIVE"
                      values={{
                        symbol: secondaryIncentiveData.symbol,
                      }}
                    />
                  }
                  rate={secondaryIncentiveApy}
                  symbol={secondaryIncentiveData.symbol}
                  isIncentive
                />
              )}
            </Box>
            <Box sx={{ minWidth: theme.spacing(27) }}>
              <CardValue
                rate={formattedRate}
                symbol={symbol}
                title={<FormattedMessage defaultMessage={'ORGANIC'} />}
              />
              {incentiveData && !secondaryIncentiveData && (
                <CardValue
                  title={
                    <FormattedMessage
                      defaultMessage="{symbol} INCENTIVE"
                      values={{
                        symbol: incentiveData.symbol,
                      }}
                    />
                  }
                  rate={incentiveApy}
                  symbol={incentiveData.symbol}
                  isIncentive
                />
              )}
              {incentiveData && secondaryIncentiveData && (
                <CardValue
                  title={<FormattedMessage defaultMessage="INCENTIVES" />}
                  rate={totalIncentivesApy}
                  symbol={incentiveData.symbol}
                  incentiveData={incentiveData}
                  secondaryIncentiveData={secondaryIncentiveData}
                  isIncentive
                />
              )}
            </Box>
          </ContentWrapper>
        </Box>
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
