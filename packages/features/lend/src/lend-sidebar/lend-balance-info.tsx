import { useEffect } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { MiniButton } from '@notional-finance/mui';
import { TradeProperty, TradePropertyKeys } from '@notional-finance/trade';
import { FormattedMessage } from 'react-intl';
import { useBalanceInfo } from '../store/use-balance-info';

interface LendBalanceInfoProps {
  setInputAmount: (input: string) => void;
}

const BalanceInfoWrapper = styled(Box)(
  ({ theme }) => `
  padding: ${theme.spacing(2)};
  width: 50%;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  flex-wrap: wrap;
`
);

const BalanceWrapper = styled(Box)(
  ({ theme }) => `
    background: ${theme.palette.background.default};
    border-radius: ${theme.shape.borderRadiusLarge};
    display: flex;
  `
);

export const LendBalanceInfo = ({ setInputAmount }: LendBalanceInfoProps) => {
  const theme = useTheme();
  const {
    usedAccountBalance,
    usedWalletBalance,
    hasCashBalance,
    cashBalanceString,
    fillDefaultCashBalance,
  } = useBalanceInfo();

  // Fills the default cash balance once when the page loads or when the
  // token changes
  useEffect(() => {
    if (fillDefaultCashBalance) setInputAmount(cashBalanceString);
  }, [fillDefaultCashBalance, cashBalanceString, setInputAmount]);

  return (
    <Box
      sx={{
        display: {
          xs: 'none',
          sm: 'none',
          md: 'block',
          lg: 'block',
          xl: 'block',
        },
      }}
    >
      {hasCashBalance && (
        <BalanceWrapper>
          <BalanceInfoWrapper>
            <TradeProperty
              value={usedAccountBalance}
              propertyKey={TradePropertyKeys.fromCashBalance}
            />
            <Box sx={{ marginTop: theme.spacing(1) }}>
              <MiniButton
                isVisible={!!cashBalanceString}
                onClick={() => setInputAmount(cashBalanceString)}
              >
                <FormattedMessage
                  defaultMessage="Max Cash"
                  description="button label"
                />
              </MiniButton>
            </Box>
          </BalanceInfoWrapper>
          <BalanceInfoWrapper>
            <TradeProperty
              value={usedWalletBalance}
              propertyKey={TradePropertyKeys.fromWalletBalance}
            />
            <MiniButton isVisible={false}>
              <FormattedMessage
                defaultMessage="Max Deposit"
                description="button label"
              />
            </MiniButton>
          </BalanceInfoWrapper>
        </BalanceWrapper>
      )}
    </Box>
  );
};

export default LendBalanceInfo;
