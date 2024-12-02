import { Box, styled, SxProps, useTheme } from '@mui/material';
import { checkStarterBoostToken } from '@notional-finance/helpers';
import { RocketIcon } from '@notional-finance/icons';
import { Body, CountUp, LabelValue } from '@notional-finance/mui';
import { BaseTradeState } from '@notional-finance/notionable';
import { useWalletStore } from '@notional-finance/notionable-hooks';
import { checkBoostEndDate } from '@notional-finance/notionable/global/account/communities';
import { boostEndDateString, RATE_PRECISION } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';

interface StarterBoostProps {
  state: BaseTradeState;
  sx?: SxProps;
}

export const StarterBoost = ({ sx, state }: StarterBoostProps) => {
  const theme = useTheme();
  const { isStarterBoostUser } = useWalletStore();
  const { depositBalance } = state;
  const boostValue = depositBalance?.mulInRatePrecision(
    Math.floor((0.05 / 52) * RATE_PRECISION)
  );
  const validBoostDate = checkBoostEndDate();
  const isStarterBoost = checkStarterBoostToken(
    state?.selectedDepositToken || '',
    isStarterBoostUser
  );

  const starterBoostActive =
    isStarterBoost &&
    validBoostDate &&
    (state.tradeType === 'LendFixed' ||
      state.tradeType === 'LendVariable' ||
      state.tradeType === 'MintNToken');

  return (
    <Container sx={{ ...sx, display: starterBoostActive ? 'flex' : 'none' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          width: '100%',
          marginBottom: theme.spacing(2),
        }}
      >
        <LabelValue sx={{ display: 'flex', alignItems: 'center' }}>
          <RocketIcon
            sx={{
              height: theme.spacing(2),
              width: theme.spacing(2),
              marginRight: theme.spacing(1),
            }}
          />
          <FormattedMessage defaultMessage={'Starter Boost Bonus'} />
        </LabelValue>
        <LabelValue
          sx={{
            color: theme.palette.primary.main,
            paddingBottom: theme.spacing(0.5),
          }}
        >
          <CountUp
            value={boostValue?.toFloat() || 0}
            suffix={` ${state.selectedDepositToken}`}
            decimals={4}
          />
        </LabelValue>
      </Box>
      <Body sx={{ width: '100%' }}>
        <FormattedMessage
          defaultMessage={
            'Bonus will be distributed {endDate} if held for 30 days.'
          }
          values={{ endDate: boostEndDateString }}
        />
      </Body>
    </Container>
  );
};

const Container = styled(Box)(
  ({ theme }) => `
    flex-direction: column;
    align-items: center;
    padding: ${theme.spacing(3)};
    margin-bottom: ${theme.spacing(2)};
    border-radius: ${theme.shape.borderRadius()};
    border: ${theme.shape.borderStandard};
    background: ${theme.palette.background.default};
    `
);

export default StarterBoost;
