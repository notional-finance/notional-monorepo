import { useCallback, useMemo } from 'react';
import {
  MultiValueIconCell,
  MultiValueCell,
  TxnHashCell,
  DateTimeCell,
  ViewAsAddressCell,
} from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import {
  useSelectedNetwork,
  useWalletStore,
} from '@notional-finance/notionable-hooks';
import { useNavigate } from 'react-router-dom';
import { Network } from '@notional-finance/util';

export const useAllTransactionsTable = () => {
  const walletStore = useWalletStore();
  const selectedNetwork = useSelectedNetwork();
  const navigate = useNavigate();

  const addressClick = useCallback(
    (address: string, network: Network) => {
      walletStore?.setUserWallet({
        selectedChain: selectedNetwork || Network.mainnet,
        selectedAddress: address,
        isReadOnlyAddress: true,
        label: 'ReadOnly',
      });

      navigate(`/portfolio/${network}/overview`);
    },
    [navigate, walletStore, selectedNetwork]
  );

  const columns = useMemo<Array<any>>(
    () => [
      {
        header: (
          <FormattedMessage
            defaultMessage="Transaction Type"
            description={'Transaction Type header'}
          />
        ),
        accessorKey: 'transactionType',
        cell: MultiValueIconCell,
        showSentAndReceivedIcons: true,
        minWidth: '270px',
        textAlign: 'left',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Asset"
            description={'Asset header'}
          />
        ),
        cell: MultiValueIconCell,
        accessorKey: 'asset',
        textAlign: 'left',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Underlying Amount"
            description={'Underlying Amount header'}
          />
        ),
        cell: MultiValueCell,
        accessorKey: 'underlyingAmount',
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="Price"
            description={'Price header'}
          />
        ),
        accessorKey: 'price',
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage defaultMessage="Time" description={'Time header'} />
        ),
        cell: DateTimeCell,
        accessorKey: 'time',
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage defaultMessage="Address" description={'Address'} />
        ),
        cell: ViewAsAddressCell,
        cellCallBack: addressClick,
        showLinkIcon: false,
        accessorKey: 'address',
        textAlign: 'right',
      },
      {
        header: (
          <FormattedMessage
            defaultMessage="TX LINK"
            description={'TX LINK header'}
          />
        ),
        accessorKey: 'txLink',
        cell: TxnHashCell,
        textAlign: 'right',
        showLinkIcon: true,
      },
    ],
    []
  );

  return { columns };
};
