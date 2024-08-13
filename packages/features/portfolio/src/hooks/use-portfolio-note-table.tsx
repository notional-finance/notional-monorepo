import { useMemo } from 'react';
import { FormattedMessage } from 'react-intl';
import {
  MultiValueIconCell,
  DataTableColumn,
  MultiValueCell,
  DisplayCell,
  MessageCell,
} from '@notional-finance/mui';
import {
  useFiat,
  useNotePrice,
  useNotionalContext,
} from '@notional-finance/notionable-hooks';
import { useTheme } from '@mui/material';
import { Network, SupportedNetworks } from '@notional-finance/util';
import { useNavigate } from 'react-router-dom';
import { TokenBalance } from '@notional-finance/core-entities';

export function usePortfolioNOTETable() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { notePrice } = useNotePrice();
  const {
    globalState: { networkAccounts },
  } = useNotionalContext();
  let hasNoteOrSNote = false;
  const baseCurrency = useFiat();
  const result = SupportedNetworks.map((network) => {
    const account = networkAccounts
      ? networkAccounts[network].accountDefinition
      : undefined;
    const totalIncentives = networkAccounts
      ? networkAccounts[network].totalIncentives
      : undefined;
    const unclaimedNOTE =
      totalIncentives && totalIncentives['NOTE']
        ? totalIncentives['NOTE'].current
        : undefined;
    const noteBalance = account?.balances.find((t) => t.symbol === 'NOTE');
    const sNoteBalance = account?.balances.find((t) => t.symbol === 'sNOTE');

    hasNoteOrSNote =
      !noteBalance?.isZero() || !sNoteBalance?.isZero() ? true : false;

    const getTotalNote = () => {
      let total = undefined as TokenBalance | undefined;
      if (noteBalance && unclaimedNOTE) {
        total = noteBalance?.add(unclaimedNOTE);
      } else if (noteBalance && !unclaimedNOTE) {
        total = noteBalance;
      } else if (!noteBalance && unclaimedNOTE) {
        total = unclaimedNOTE;
      }

      return total;
    };

    if (
      (unclaimedNOTE === undefined || unclaimedNOTE?.isZero()) &&
      noteBalance?.isZero()
    ) {
      return null;
    }

    return {
      asset: {
        symbol: 'NOTE',
        symbolSize: 'large',
        symbolBottom: '',
        label: 'NOTE',
        network: network,
        caption: network.charAt(0).toUpperCase() + network.slice(1),
      },
      message:
        network !== Network.mainnet ? (
          <FormattedMessage
            defaultMessage={'Staking only available on Mainnet'}
          />
        ) : undefined,
      notePrice:
        notePrice?.toFiat(baseCurrency).toDisplayStringWithSymbol(2) || '-',
      walletBalance: {
        data: [
          {
            displayValue:
              noteBalance?.toDisplayStringWithSymbol(2, true, false) || '-',
            isNegative: false,
          },
          {
            displayValue:
              noteBalance
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false) || '-',
            isNegative: false,
          },
        ],
      },
      unclaimedNOTE: {
        data: [
          {
            displayValue:
              unclaimedNOTE?.toDisplayStringWithSymbol(2, true, false) || '-',
            isNegative: false,
          },
          {
            displayValue:
              unclaimedNOTE
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false) || '-',
            isNegative: false,
          },
        ],
      },
      totalNOTE: {
        data: [
          {
            displayValue:
              getTotalNote()?.toDisplayStringWithSymbol(2, true, false) || '-',
            isNegative: false,
          },
          {
            displayValue:
              getTotalNote()
                ?.toFiat(baseCurrency)
                .toDisplayStringWithSymbol(2, true, false) || '-',
            isNegative: false,
          },
        ],
      },
      actionRow: {
        // NOTE: this is not displayed in the table. Just here to please typescript and allow us to use the same action row component
        subRowData: [
          {
            label: <FormattedMessage defaultMessage={'Amount'} />,
            value: '',
          },
          {
            label: <FormattedMessage defaultMessage={'Entry Price'} />,
            value: '',
          },
          {
            label: <FormattedMessage defaultMessage={'CURRENT PRICE'} />,
            value: '',
          },
        ],
        buttonBarData: [
          {
            buttonText: <FormattedMessage defaultMessage={'Unstake'} />,
            callback: () => console.log('Unstake'),
          },
          {
            buttonText: <FormattedMessage defaultMessage={'Stake More'} />,
            callback: () => navigate('/stake/ETH'),
          },
        ],
        txnHistory: ``,
      },
    };
  });

  const Columns = useMemo<DataTableColumn[]>(
    () => [
      {
        header: <FormattedMessage defaultMessage="Asset" />,
        cell: MultiValueIconCell,
        accessorKey: 'asset',
        textAlign: 'left',
        expandableTable: true,
      },
      {
        header: '',
        cell: MessageCell,
        accessorKey: 'message',
        textAlign: 'left',
        expandableTable: true,
        width: '280px',
      },
      {
        header: <FormattedMessage defaultMessage="NOTE Price" />,
        cell: DisplayCell,
        accessorKey: 'notePrice',
        textAlign: 'right',
        expandableTable: true,
      },
      {
        header: <FormattedMessage defaultMessage="Wallet Balance" />,
        cell: MultiValueCell,
        accessorKey: 'walletBalance',
        textAlign: 'right',
        expandableTable: true,
        showLoadingSpinner: true,
        fontWeightBold: true,
      },
      {
        header: <FormattedMessage defaultMessage="Unclaimed NOTE" />,
        cell: MultiValueCell,
        accessorKey: 'unclaimedNOTE',
        textAlign: 'right',
        expandableTable: true,
        fontWeightBold: true,
      },
      {
        header: <FormattedMessage defaultMessage="Total NOTE" />,
        cell: MultiValueCell,
        accessorKey: 'totalNOTE',
        textAlign: 'right',
        expandableTable: true,
        fontWeightBold: true,
      },
    ],
    [theme]
  );

  const filteredResult = result.filter((r) => r !== null);

  return {
    noteColumns: Columns,
    noteData: filteredResult,
    hasNoteOrSNote,
    initialNoteState: { expanded: { 0: false, 1: false }, clickDisabled: true },
  };
}
