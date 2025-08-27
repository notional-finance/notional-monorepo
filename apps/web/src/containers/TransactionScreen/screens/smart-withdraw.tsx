import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { Body, LinkText } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';

export const VaultSmartWithdraw = observer(() => {
  useTradeContext('InitiateWithdraw');

  return (
    <TransactionScreen
      actionPrefix="Smart Withdraw"
      hasBackButton
      submitText={defineMessage({
        defaultMessage: 'Initiate Smart Withdraw',
      })}
      inputs={[
        <Body main inline>
          Smart withdraw redeems your staked tokens from the project that issued
          them. Once you initiate smart withdrawal, your leveraged position is
          locked until your redemption finalizes and you stop earning yield.
          Once your redemption finalizes and you receive the unstaked tokens,
          you can repay your debt and exit.{' '}
          <LinkText inline>Read more</LinkText>
        </Body>,
      ]}
    />
  );
});
