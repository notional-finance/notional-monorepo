import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { VaultActionContext } from '../vault';
import {
  useVaultPosition,
  useVaultProperties,
} from '@notional-finance/notionable-hooks';
import {
  PRIME_CASH_VAULT_MATURITY,
  leveragedYield,
  formatMaturity,
} from '@notional-finance/util';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { InfoMessageProps } from '@notional-finance/mui';

export function useManageVault() {
  const {
    state: { vaultAddress, debtOptions, selectedNetwork },
  } = useContext(VaultActionContext);
  const { vaultName, enabled, vaultType } = useVaultProperties(
    selectedNetwork,
    vaultAddress
  );
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);

  if (!vaultPosition) {
    return {
      manageVaultOptions: [],
      rollMaturityOptions: [],
      vaultName,
    };
  } else if (!enabled) {
    // If the vault is disabled, only show the withdraw option
    return {
      manageVaultOptions: [
        {
          label: <FormattedMessage defaultMessage={'Withdraw'} />,
          link: `/vaults/${selectedNetwork}/${vaultAddress}/WithdrawVault`,
          key: 'WithdrawVault',
        },
      ],
      rollMaturityOptions: [],
      vaultName,
      infoMessage: {
        variant: 'warning',
        title:
          vaultType === 'PendlePT' ? (
            <FormattedMessage defaultMessage={'Withdraw Now'} />
          ) : (
            <FormattedMessage defaultMessage={'Vault Disabled'} />
          ),
        message:
          vaultType === 'PendlePT' ? (
            <FormattedMessage
              defaultMessage={
                'Your PT tokens have expired. Withdraw your profits and close your vault position.'
              }
            />
          ) : (
            <FormattedMessage
              defaultMessage={
                'This vault is currently disabled. You are able to withdraw your funds.'
              }
            />
          ),
      } as InfoMessageProps,
    };
  } else {
    const manageVaultOptions = [
      {
        label: <FormattedMessage defaultMessage={'Deposit'} />,
        link: `/vaults/${selectedNetwork}/${vaultAddress}/IncreaseVaultPosition`,
        key: 'IncreaseVaultPosition',
      },
      {
        label: <FormattedMessage defaultMessage={'Withdraw'} />,
        link: `/vaults/${selectedNetwork}/${vaultAddress}/WithdrawVault`,
        key: 'WithdrawVault',
      },
      {
        label: <FormattedMessage defaultMessage={'Adjust Leverage'} />,
        link: `/vaults/${selectedNetwork}/${vaultAddress}/AdjustLeverage`,
        key: 'AdjustLeverage',
      },
    ];

    const rollMaturityOptions =
      debtOptions
        ?.map((o) => {
          const totalAPY = leveragedYield(
            vaultPosition.strategyAPY,
            o.interestRate,
            vaultPosition.leverageRatio || 0
          );
          const label =
            o.token.maturity &&
            o.token.maturity !== PRIME_CASH_VAULT_MATURITY ? (
              <FormattedMessage
                defaultMessage={'Convert to Fixed ({maturity})'}
                values={{ maturity: formatMaturity(o.token.maturity) }}
              />
            ) : (
              <FormattedMessage defaultMessage={'Convert to Open Term'} />
            );

          return {
            label,
            link: `/vaults/${selectedNetwork}/${vaultAddress}/RollVaultPosition/${o.token.id}`,
            key: 'RollVaultPosition',
            totalAPY: totalAPY
              ? `${formatNumberAsPercent(totalAPY)} Total APY`
              : undefined,
          };
        })
        .filter((_) => !!_.totalAPY) || [];

    return {
      manageVaultOptions,
      rollMaturityOptions,
      vaultName,
    };
  }
}
