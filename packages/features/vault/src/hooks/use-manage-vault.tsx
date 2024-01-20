import { useContext } from 'react';
import { FormattedMessage } from 'react-intl';
import { VaultActionContext } from '../vault';
import { useVaultPosition } from '@notional-finance/notionable-hooks';
import {
  PRIME_CASH_VAULT_MATURITY,
  leveragedYield,
  formatMaturity,
} from '@notional-finance/util';
import { formatNumberAsPercent } from '@notional-finance/helpers';

export function useManageVault() {
  const {
    state: { vaultAddress, debtOptions, selectedNetwork },
    updateState,
  } = useContext(VaultActionContext);
  const vaultPosition = useVaultPosition(selectedNetwork, vaultAddress);

  if (!vaultPosition) {
    return {
      reduceLeverageOptions: [],
      manageVaultOptions: [],
      rollMaturityOptions: [],
    };
  } else {
    const manageVaultOptions = [
      {
        label: <FormattedMessage defaultMessage={'Increase Vault Position'} />,
        link: `/vaults/${selectedNetwork}/${vaultAddress}/IncreaseVaultPosition`,
        key: 'IncreaseVaultPosition',
      },
      {
        label: <FormattedMessage defaultMessage={'Withdraw'} />,
        link: `/vaults/${selectedNetwork}/${vaultAddress}/WithdrawVault`,
        key: 'WithdrawVault',
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
            onClick: () => {
              updateState({ debt: o.token });
            },
            totalAPY: totalAPY
              ? `${formatNumberAsPercent(totalAPY)} Total APY`
              : undefined,
          };
        })
        .filter((_) => !!_.totalAPY) || [];

    return {
      reduceLeverageOptions: [
        {
          label: <FormattedMessage defaultMessage={'Deposit Collateral'} />,
          link: `/vaults/${selectedNetwork}/${vaultAddress}/DepositVaultCollateral`,
          key: 'DepositCollateral',
        },
        {
          label: (
            <FormattedMessage defaultMessage={'Repay Debt with Vault Assets'} />
          ),
          link: `/vaults/${selectedNetwork}/${vaultAddress}/WithdrawAndRepayVault`,
          key: 'WithdrawAndRepayVault',
        },
      ],
      manageVaultOptions,
      rollMaturityOptions,
    };
  }
}
