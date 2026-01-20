import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { useTradeContext } from '@notional-finance/notionable-hooks';
import { Body, LinkText } from '@notional-finance/mui';
import { defineMessage } from 'react-intl';
import SmartWithdrawInfo from './SmartWithdraw.svg';

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
          <LinkText
            inline
            href="https://docs.notional.finance/exponent/overview/smart-withdrawal"
          >
            Read more
          </LinkText>
        </Body>,
        <img src={SmartWithdrawInfo} alt="Smart Withdraw" />,
      ]}
    />
  );
});

export const VaultPendingWithdraw = observer(() => {
  // Use manage vault since it has no action
  useTradeContext('ManageVault');

  return (
    <TransactionScreen
      actionPrefix="Pending Withdraw"
      hideSubmitButton
      inputs={[
        <Body main inline>
          Smart withdraw redeems your staked tokens from the project that issued
          them. Once you initiate smart withdrawal, your leveraged position is
          locked until your redemption finalizes and you stop earning yield.
          Once your redemption finalizes and you receive the unstaked tokens,
          you can repay your debt and exit.{' '}
          <LinkText inline>Read more</LinkText>
        </Body>,
        <img src={SmartWithdrawInfo} alt="Smart Withdraw" />,
      ]}
    />
  );
});
