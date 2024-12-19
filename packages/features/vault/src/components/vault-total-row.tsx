import { InfoTooltip, TotalRow } from '@notional-finance/mui';
import { useCurrentTradeContext } from '@notional-finance/notionable-hooks';
import { SxProps, useTheme } from '@mui/material';
import { defineMessage } from 'react-intl';
import { TokenBalance } from '@notional-finance/core-entities';
import { useAppStore } from '@notional-finance/notionable-hooks';
import { useVaultNameInfo } from '../hooks';

const ToolTip = ({ title, sx }: { title?: string; sx: SxProps }) => {
  const trade = useCurrentTradeContext();
  const maxPoolShare = trade?.getVaultCapacity()?.maxPoolShare;
  const theme = useTheme();
  const { baseProtocol, boosterProtocol } = useVaultNameInfo() ?? {};

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
        baseProtocol: baseProtocol,
        boosterProtocol: boosterProtocol,
      },
    }),
    poolCapWithMaxShareSameProtocol: defineMessage({
      defaultMessage:
        'This vault can only hold {maxPoolShare} of total LP tokens in the {boosterProtocol} pool. Remaining pool capacity can change as liquidity in the {boosterProtocol} pool increases or decreases.',
      values: {
        maxPoolShare: maxPoolShare,
        boosterProtocol: boosterProtocol,
      },
    }),
  };

  const currentTip = title?.includes('Borrow Capacity')
    ? toopTipData.borrowCapacity
    : baseProtocol === boosterProtocol
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
  const trade = useCurrentTradeContext();
  const { baseCurrency } = useAppStore();
  const props = trade?.getVaultCapacity();
  const { totalCapacityRemaining, totalPoolCapacityRemaining, vaultTVL } =
    props ?? {};
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

const TotalRowPendlePT = () => {
  const trade = useCurrentTradeContext();
  const { baseCurrency } = useAppStore();
  const { collateral } = trade?.selectedTokens ?? {};
  const props = trade?.getVaultCapacity();
  const { totalCapacityRemaining, vaultTVL } = props ?? {};
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
  const trade = useCurrentTradeContext();
  const vaultType = trade?.vaultType;

  if (vaultType?.startsWith('SingleSidedLP')) {
    return <TotalRowSingleSidedLP />;
  } else if (vaultType === 'PendlePT') {
    return <TotalRowPendlePT />;
  } else {
    return null;
  }
};
