import { InfoTooltip, TotalRow } from '@notional-finance/mui';
import {
  useAllVaults,
  useAppState,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { VaultActionContext } from '../vault';
import { useContext } from 'react';
import { SxProps, useTheme } from '@mui/material';
import { defineMessage } from 'react-intl';
import { getVaultType, TokenBalance } from '@notional-finance/core-entities';

const ToolTip = ({ title, sx }: { title?: string; sx: SxProps }) => {
  const selectedNetwork = useSelectedNetwork();
  const { state } = useContext(VaultActionContext);
  const { maxPoolShare, vaultAddress } = state;
  const theme = useTheme();
  const listedVaults = useAllVaults(selectedNetwork);
  const vaultData = listedVaults.find(
    (vault) => vault.vaultAddress === vaultAddress
  );

  const toopTipData = {
    borrowCapacity: defineMessage({
      defaultMessage:
        'Remaining amount that can be borrowed by this vault before max capacity.',
    }),
    poolCapWithMaxShare: defineMessage({
      defaultMessage:
        'This vault can only hold {maxPoolShare} of total LP tokens in the {boosterProtocol} / {baseProtocol} pool. Remaining pool capacity can change as liquidity in the {boosterProtocol} / {baseProtocol} pool increases or decreases.',
      values: {
        maxPoolShare: maxPoolShare,
        baseProtocol: vaultData?.baseProtocol,
        boosterProtocol: vaultData?.boosterProtocol,
      },
    }),
    poolCapWithMaxShareSameProtocol: defineMessage({
      defaultMessage:
        'This vault can only hold {maxPoolShare} of total LP tokens in the {boosterProtocol} pool. Remaining pool capacity can change as liquidity in the {boosterProtocol} pool increases or decreases.',
      values: {
        maxPoolShare: maxPoolShare,
        boosterProtocol: vaultData?.boosterProtocol,
      },
    }),
  };

  const currentTip = title?.includes('Borrow Capacity')
    ? toopTipData.borrowCapacity
    : vaultData?.baseProtocol === vaultData?.boosterProtocol
    ? toopTipData.poolCapWithMaxShareSameProtocol
    : toopTipData.poolCapWithMaxShare;

  return (
    <InfoTooltip
      sx={{ ...sx }}
      iconSize={theme.spacing(2)}
      iconColor={theme.palette.typography.accent}
      toolTipText={currentTip}
    />
  );
};

const TotalRowSingleSidedLP = () => {
  const { state } = useContext(VaultActionContext);
  const { baseCurrency } = useAppState();
  const { totalCapacityRemaining, totalPoolCapacityRemaining, vaultTVL } =
    state;
  const tvl = vaultTVL?.toFiat(baseCurrency);
  const totalsData = [
    {
      title: 'TVL',
      value: tvl?.toFloat(),
      prefix: tvl?.fiatSymbol,
      decimals: 2,
    },
    {
      title: 'Remaining Borrow Capacity',
      Icon: ToolTip,
      value: totalCapacityRemaining?.isNegative()
        ? 0
        : totalCapacityRemaining?.toFloat(),
      suffix: ` ${totalCapacityRemaining?.symbol || ''}`,
      decimals: 0,
    },
    {
      title: 'Remaining Pool Capacity',
      Icon: ToolTip,
      value: totalPoolCapacityRemaining?.isNegative()
        ? 0
        : totalPoolCapacityRemaining?.toFloat(),
      suffix: ` ${totalPoolCapacityRemaining?.symbol || ''}`,
      decimals: 0,
    },
  ];
  return <TotalRow totalsData={totalsData} />;
};

const TotalRowSingleSidedLPDirectClaim = () => {
  const { state } = useContext(VaultActionContext);
  const { baseCurrency } = useAppState();
  const { totalCapacityRemaining, totalPoolCapacityRemaining, vaultTVL } =
    state;
  const tvl = vaultTVL?.toFiat(baseCurrency);
  const totalsData = [
    {
      title: 'TVL',
      value: tvl?.toFloat(),
      prefix: tvl?.fiatSymbol,
      decimals: 2,
    },
    {
      title: 'Remaining Borrow Capacity',
      Icon: ToolTip,
      value: totalCapacityRemaining?.isNegative()
        ? 0
        : totalCapacityRemaining?.toFloat(),
      suffix: ` ${totalCapacityRemaining?.symbol || ''}`,
      decimals: 0,
    },
    {
      title: 'Remaining Pool Capacity',
      Icon: ToolTip,
      value: totalPoolCapacityRemaining?.isNegative()
        ? 0
        : totalPoolCapacityRemaining?.toFloat(),
      suffix: ` ${totalPoolCapacityRemaining?.symbol || ''}`,
      decimals: 0,
    },
  ];
  console.log(totalsData);
  return <div></div>;
};

const TotalRowPendlePT = () => {
  const { state } = useContext(VaultActionContext);
  const { baseCurrency } = useAppState();
  const { totalCapacityRemaining, vaultTVL, collateral } = state;
  const tvl = vaultTVL?.toFiat(baseCurrency);
  const totalsData = [
    {
      title: 'TVL',
      value: tvl?.toFloat(),
      prefix: tvl?.fiatSymbol,
      decimals: 2,
    },
    {
      title: 'Remaining Borrow Capacity',
      Icon: ToolTip,
      value: totalCapacityRemaining?.isNegative()
        ? 0
        : totalCapacityRemaining?.toFloat(),
      suffix: ` ${totalCapacityRemaining?.symbol || ''}`,
      decimals: 0,
    },
    {
      title: 'Pendle PT Price',
      value: collateral
        ? TokenBalance.unit(collateral)
            .toUnderlying()
            .toDisplayStringWithSymbol(3, false, false)
        : '-',
    },
  ];
  return <TotalRow totalsData={totalsData} />;
};

export const VaultTotalRow = () => {
  const { state } = useContext(VaultActionContext);
  const { vaultAddress, selectedNetwork } = state;
  const vaultType =
    vaultAddress && selectedNetwork
      ? getVaultType(vaultAddress, selectedNetwork)
      : undefined;

  if (vaultType?.startsWith('SingleSidedLP')) {
    return <TotalRowSingleSidedLP />;
  } else if (vaultType === 'PendlePT') {
    return <TotalRowPendlePT />;
  } else if (vaultType === 'SingleSidedLP_DirectClaim') {
    return <TotalRowSingleSidedLPDirectClaim />;
  } else {
    return null;
  }
};
