import { LeverageSlider } from '@notional-finance/trade';
import { TransactionScreen } from '../transaction-screen';
import { observer } from 'mobx-react-lite';
import { defineMessage } from 'react-intl';
import {
  useCurrentTradeContext,
  useTradeContext,
  useVaultMetadata,
} from '@notional-finance/notionable-hooks';

export const VaultAdjustLeverage = observer(() => {
  useTradeContext('AdjustVaultLeverage');
  const trade = useCurrentTradeContext();
  const vaultMetadata = useVaultMetadata(trade?.vaultAddress);
  const allowDeleverage =
    vaultMetadata?.vaultFeatures.includes('Instant Withdrawal');

  return (
    <TransactionScreen
      actionPrefix="Adjust Leverage"
      hasBackButton
      inputs={[
        <LeverageSlider
          key="leverage-slider"
          allowDeleverage={allowDeleverage}
          inputLabel={defineMessage({
            defaultMessage: 'Leverage',
          })}
        />,
      ]}
    />
  );
});
