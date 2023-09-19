import { useContext, useEffect } from 'react';
import { FormattedMessage } from 'react-intl';
import { VaultActionContext } from '../vault-view/vault-action-provider';
import { TokenBalance } from '@notional-finance/core-entities';
import { useAllMarkets } from '@notional-finance/notionable-hooks';
import {
  PRIME_CASH_VAULT_MATURITY,
  leveragedYield,
} from '@notional-finance/util';
import {
  formatMaturity,
  formatNumberAsPercent,
} from '@notional-finance/helpers';

export function useManageVault() {
  const {
    state: {
      vaultAddress,
      priorAccountRisk,
      tradeType,
      debtOptions,
      deposit,
      depositBalance,
    },
    updateState,
  } = useContext(VaultActionContext);
  const {
    yields: { vaultShares },
  } = useAllMarkets();
  const vaultSharesAPY = vaultShares.find(
    (y) => y.token.vaultAddress === vaultAddress
  )?.totalAPY;

  useEffect(() => {
    // This is used to get the debt options for rolling the maturity
    if (tradeType !== 'RollVaultPosition' || !depositBalance)
      updateState({
        tradeType: 'RollVaultPosition',
        depositBalance: deposit ? TokenBalance.zero(deposit) : undefined,
      });
  }, [tradeType, updateState, deposit, depositBalance]);

  if (!priorAccountRisk || !vaultAddress) {
    return {
      reduceLeverageOptions: [],
      manageVaultOptions: [],
      rollMaturityOptions: [],
    };
  } else {
    const manageVaultOptions = [
      {
        label: <FormattedMessage defaultMessage={'Increase Vault Position'} />,
        link: `/vaults/${vaultAddress}/IncreaseVaultPosition`,
        key: 'IncreaseVaultPosition',
      },
      {
        label: <FormattedMessage defaultMessage={'Withdraw'} />,
        link: `/vaults/${vaultAddress}/WithdrawVault`,
        key: 'WithdrawVault',
      },
    ];

    const rollMaturityOptions =
      debtOptions
        ?.map((o) => {
          const totalAPY = leveragedYield(
            vaultSharesAPY,
            o.interestRate,
            priorAccountRisk.leverageRatio || 0
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
            link: `/vaults/${vaultAddress}/RollVaultPosition/${o.token.id}`,
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
          link: `/vaults/${vaultAddress}/DepositVaultCollateral`,
          key: 'DepositCollateral',
        },
        {
          label: (
            <FormattedMessage defaultMessage={'Repay Debt with Vault Assets'} />
          ),
          link: `/vaults/${vaultAddress}/WithdrawAndRepayVault`,
          key: 'WithdrawAndRepayVault',
        },
      ],
      manageVaultOptions,
      rollMaturityOptions,
    };
  }
}
