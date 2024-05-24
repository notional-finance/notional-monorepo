import { useCallback, useContext } from 'react';
import { NOTEContext } from '..';
import { Box, useTheme } from '@mui/material';
import {
  // PendingTransaction,
  TransactionSidebar,
} from '@notional-finance/trade';
import { FormattedMessage } from 'react-intl';
import {
  Body,
  LabelValue,
  CountdownCards,
  Button,
  Caption,
} from '@notional-finance/mui';
import {
  useAccountDefinition,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import {
  Network,
  SETTINGS_SIDE_DRAWERS,
  getDateString,
  getProviderFromNetwork,
} from '@notional-finance/util';
import {
  useSideDrawerManager,
  useSideDrawerState,
} from '@notional-finance/side-drawer';
import { SNOTEWeightedPool } from '@notional-finance/core-entities';

export const CoolDown = () => {
  const theme = useTheme();
  const context = useContext(NOTEContext);
  // const {
  //   state: { selectedNetwork },
  // } = context;
  const { sideDrawerOpen } = useSideDrawerState();
  // TODO add this commented code back in when I can test that the pending transaction works correctly
  // const { isReadOnlyAddress, onSubmit, transactionStatus, transactionHash } =
  //   useTransactionStatus(Network.mainnet);
  const { isReadOnlyAddress, onSubmit } = useTransactionStatus(Network.mainnet);
  const { setWalletSideDrawer, clearWalletSideDrawer } = useSideDrawerManager();
  const account = useAccountDefinition(Network.mainnet);
  const stakeNoteStatus = account?.stakeNOTEStatus;
  const redeemWindowBeginDate = stakeNoteStatus?.redeemWindowBegin
    ? new Date(stakeNoteStatus.redeemWindowBegin * 1000)
    : null;

  const handleConnectWallet = () => {
    if (sideDrawerOpen) {
      clearWalletSideDrawer();
    }
    if (!sideDrawerOpen) {
      setWalletSideDrawer(SETTINGS_SIDE_DRAWERS.CONNECT_WALLET);
    }
  };

  const handleSubmit = useCallback(async () => {
    if (isReadOnlyAddress || !account) return;
    const populatedTxn = await SNOTEWeightedPool.sNOTE_Contract
      .connect(getProviderFromNetwork(Network.mainnet))
      .populateTransaction.stopCoolDown();

    onSubmit('StopSNOTECooldown', populatedTxn);
  }, [isReadOnlyAddress, account, onSubmit]);

  return (
    <TransactionSidebar
      riskComponent={<div />}
      context={context}
      showDrawer
      mobileTopMargin={theme.spacing(16)}
      showActionButtons={false}
    >
      {redeemWindowBeginDate && (
        <Box>
          <CountdownCards futureDate={redeemWindowBeginDate} variant="small" />
          <Caption>
            <FormattedMessage
              defaultMessage={
                'Your position is locked during cooldown with the option to cancel anytime.'
              }
            />
          </Caption>
        </Box>
      )}
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Body
            sx={{
              color: theme.palette.typography.light,
              marginBottom: theme.spacing(2),
            }}
          >
            <FormattedMessage
              defaultMessage={'Redemption window will start:'}
            />
          </Body>
          <LabelValue>
            {stakeNoteStatus?.redeemWindowBegin
              ? getDateString(stakeNoteStatus.redeemWindowBegin, {
                  showTime: true,
                  slashesFormat: true,
                })
              : '-'}
          </LabelValue>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Body
            sx={{
              color: theme.palette.typography.light,
              marginBottom: theme.spacing(2),
            }}
          >
            <FormattedMessage defaultMessage={'Redemption window will end:'} />
          </Body>
          <LabelValue>
            {stakeNoteStatus?.redeemWindowEnd
              ? getDateString(stakeNoteStatus.redeemWindowEnd, {
                  showTime: true,
                  slashesFormat: true,
                })
              : '-'}
          </LabelValue>
        </Box>
      </Box>
      {/* {transactionHash && transactionStatus && (
        <PendingTransaction
          hash={transactionHash}
          transactionStatus={transactionStatus}
          selectedNetwork={selectedNetwork}
        />
      )} */}
      {isReadOnlyAddress || !account ? (
        <Button
          variant="contained"
          color="primary"
          size="large"
          onClick={handleConnectWallet}
          sx={{ marginTop: theme.spacing(10) }}
        >
          <FormattedMessage defaultMessage={'Connect Wallet to Trade'} />
        </Button>
      ) : (
        <Button
          variant="outlined"
          color="primary"
          size="large"
          onClick={handleSubmit}
          sx={{ marginTop: theme.spacing(10) }}
        >
          <FormattedMessage defaultMessage={'Cancel Cooldown'} />
        </Button>
      )}
    </TransactionSidebar>
  );
};
