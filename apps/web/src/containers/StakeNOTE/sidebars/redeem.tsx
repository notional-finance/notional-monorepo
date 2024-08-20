import { useContext } from 'react';
import { NOTEContext } from '..';
import { useTheme } from '@mui/material';
import { DepositInput, TransactionSidebar } from '@notional-finance/trade';
import { LinkText, useCurrencyInputRef, Body } from '@notional-finance/mui';
import { FormattedMessage, defineMessage } from 'react-intl';
import { TokenBalance } from '@notional-finance/core-entities';
import { useAccountDefinition } from '@notional-finance/notionable-hooks';
import { Network, getDateString } from '@notional-finance/util';
import { useCancelCoolDown } from './use-cancel-cooldown';
import { ReactNode } from 'react';

export const Redeem = () => {
  const theme = useTheme();
  const context = useContext(NOTEContext);
  const {
    state: { deposit },
  } = context;
  const { currencyInputRef: sNOTEInputRef } = useCurrencyInputRef();
  const redeemWindowEnd = useAccountDefinition(Network.mainnet)?.stakeNOTEStatus
    ?.redeemWindowEnd;
  const { cancelCoolDown } = useCancelCoolDown();

  return (
    <TransactionSidebar
      context={context}
      showDrawer
      // No approvals required for sNOTE redeem
      requiredApprovalAmount={deposit ? TokenBalance.zero(deposit) : undefined}
      mobileTopMargin={theme.spacing(16)}
      riskComponent={<div />}
    >
      <DepositInput
        inputLabel={defineMessage({
          defaultMessage: 'Enter amount of sNOTE to redeem',
        })}
        excludeSupplyCap
        ref={sNOTEInputRef}
        inputRef={sNOTEInputRef}
        context={context}
      />
      <Body marginTop={theme.spacing(-4)}>
        <FormattedMessage
          defaultMessage={
            'You have until {date} to redeem or your position will continue to be staked. <a>Cancel and continue staking</a>'
          }
          values={{
            date: (
              <Body main inline>
                {redeemWindowEnd
                  ? getDateString(redeemWindowEnd, {
                      slashesFormat: true,
                      showTime: true,
                    })
                  : ''}
              </Body>
            ),
            a: (chunks: ReactNode) => (
              <LinkText
                inline
                onClick={cancelCoolDown}
                sx={{ cursor: 'pointer' }}
              >
                {chunks}
              </LinkText>
            ),
          }}
        />
      </Body>
    </TransactionSidebar>
  );
};