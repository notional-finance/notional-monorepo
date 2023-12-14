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
  hasVaultPosition: boolean;
  netWorth?: string;
  VaultCardOverlay?: any;
  VaultCardIcon?: any;
}

export const Vault = ({
  vaultName,
  leverage,
  netWorth,
  rate,
  symbol,
  minDepositRequired,
  capacityUsedPercentage,
  capacityRemaining,
  route,
  hasVaultPosition,
  VaultCardOverlay,
  VaultCardIcon,
}: VaultProps) => {
  const theme = useTheme();
  const formattedRate = `${formatNumberAsPercent(rate, 2)} APY`;

  return (
    <Container>
      {VaultCardOverlay && <VaultCardOverlay />}
      <Link to={route}>
        <Card height={'auto'}>
          {symbol && !VaultCardOverlay && (
            <StyledIcon top={theme.spacing(-9)}>
              <TokenIcon symbol={symbol} size="extraLarge" />
            </StyledIcon>
          )}
          <>
            <CurrencyTitle
              accent
              textAlign="left"
              marginBottom={theme.spacing(1)}
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              {symbol}
              {VaultCardIcon && <VaultCardIcon iconName="degenscore" />}
            </CurrencyTitle>
            <SmallInput textAlign="left" marginBottom={theme.spacing(4)}>
              {vaultName}
            </SmallInput>
            <SectionTitle textAlign="left" gutter="default">
              {hasVaultPosition ? (
                <FormattedMessage defaultMessage="current APY" />
              ) : (
                <FormattedMessage
                  defaultMessage="{leverage} LEVERAGE"
                  values={{ leverage }}
                />
              )}
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
              {hasVaultPosition ? (
                <FormattedMessage defaultMessage="CURRENT NET WORTH" />
              ) : (
                <FormattedMessage defaultMessage="MINIMUM DEPOSIT" />
              )}
            </SectionTitle>
            <SmallInput textAlign="left" marginBottom={theme.spacing(5)}>
              {hasVaultPosition ? netWorth : minDepositRequired}
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
              hideThumb
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
            variant={hasVaultPosition ? 'outlined' : 'contained'}
            sx={{
              textTransform: 'uppercase',
            }}
          >
            {hasVaultPosition ? (
              <FormattedMessage defaultMessage="Manage Vault" />
            ) : (
              <FormattedMessage defaultMessage="Enter Vault" />
            )}
          </Button>
        </Card>
      </Link>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    min-width: 275px;
    min-height: 550px;
    ${theme.breakpoints.down('md')} {
      display: flex;
      justify-content: center;
    }
      `
);

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
