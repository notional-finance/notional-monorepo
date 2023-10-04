import { ReactNode } from 'react';
import { Box, useTheme, styled } from '@mui/material';
import { Card } from '../../card/card';
import { Link } from 'react-router-dom';
import { Button } from '../../button/button';
import { FormattedMessage } from 'react-intl';
import SliderBasic from '../../slider-basic/slider-basic';
import { TokenIcon, LightningIcon } from '@notional-finance/icons';
import { colors } from '@notional-finance/styles';
import {
  H4,
  SmallInput,
  SectionTitle,
  CurrencyTitle,
} from '../../typography/typography';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export interface VaultProps {
  symbol: string;
  leverage: string;
  vaultName: string;
  rate: number;
  minDepositRequired: string;
  capacityUsedPercentage: number;
  capacityRemaining: string;
  route: string;
  buttonText: ReactNode;
}

export const Vault = ({
  vaultName,
  leverage,
  rate,
  symbol,
  minDepositRequired,
  capacityUsedPercentage,
  capacityRemaining,
  route,
  buttonText,
}: VaultProps) => {
  const theme = useTheme();
  const formattedRate = `${formatNumberAsPercent(rate, 2)} APY`;
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
          <SmallInput textAlign="left" marginBottom={theme.spacing(4)}>
            {vaultName}
          </SmallInput>
          <SectionTitle textAlign="left" gutter="default">
            <FormattedMessage
              defaultMessage="{leverage} LEVERAGE"
              values={{ leverage }}
            />
          </SectionTitle>
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <LightningIcon
              sx={{ height: '1.5em', marginRight: theme.spacing(1) }}
            />
            <H4
              textAlign="left"
              marginBottom={theme.spacing(3)}
              fontWeight="bold"
              sx={{ color: rate < 0 ? colors.red : '' }}
            >
              {formattedRate}
            </H4>
          </Box>

          <SectionTitle textAlign="left" marginBottom={theme.spacing(1)}>
            <FormattedMessage defaultMessage="MINIMUM DEPOSIT" />
          </SectionTitle>
          <SmallInput textAlign="left" marginBottom={theme.spacing(5)}>
            {minDepositRequired}
          </SmallInput>
          <SectionTitle textAlign="left">
            <FormattedMessage defaultMessage="VAULT BORROW CAPACITY" />
          </SectionTitle>
          <SliderBasic
            min={0}
            max={100}
            value={capacityUsedPercentage}
            step={1}
            disabled={true}
            sx={{
              marginBottom: theme.spacing(0),
            }}
          />
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: theme.spacing(3),
            }}
          >
            <SectionTitle inline textAlign="left">
              <FormattedMessage defaultMessage="CAPACITY REMAINING" />
            </SectionTitle>
            <SmallInput inline textAlign="right">
              {capacityRemaining}
            </SmallInput>
          </Box>
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

export default Vault;
