import { useContext } from 'react';
import { NOTEContext } from '..';
import { Box, useTheme } from '@mui/material';
import {
  PendingTransaction,
  TransactionSidebar,
  TransactionHeadings,
} from '@notional-finance/trade';
import { FormattedMessage } from 'react-intl';
import {
  Body,
  LabelValue,
  CountdownCards,
  Button,
  Caption,
  ExternalLink,
} from '@notional-finance/mui';
import {
  useAccountDefinition,
  useSideDrawerManager,
  useSideDrawerState,
} from '@notional-finance/notionable-hooks';
import {
  Network,
  SETTINGS_SIDE_DRAWERS,
  getDateString,
} from '@notional-finance/util';
import { useCancelCoolDown } from './use-cancel-cooldown';

export const CoolDown = () => {
  const theme = useTheme();
  const context = useContext(NOTEContext);
  const {
    state: { selectedNetwork },
  } = context;
  const { sideDrawerOpen } = useSideDrawerState();
  const {
    cancelCoolDown,
    transactionStatus,
    transactionHash,
    isReadOnlyAddress,
  } = useCancelCoolDown();

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

  return (
    <TransactionSidebar
      riskComponent={<div />}
      context={context}
      showDrawer
      mobileTopMargin={theme.spacing(16)}
      hideActionButtons={true}
      helptext={{
        ...TransactionHeadings.StakeNOTECoolDown.helptext,
        values: {
          a: (chunk: React.ReactNode) => (
            <ExternalLink
              accent
              textDecoration
              href={
                'https://docs.notional.finance/notional-v3/governance/note-staking'
              }
            >
              {chunk}
            </ExternalLink>
          ),
        },
      }}
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
      {transactionHash && transactionStatus && (
        <PendingTransaction
          hash={transactionHash}
          transactionStatus={transactionStatus}
          selectedNetwork={selectedNetwork}
        />
      )}
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
          onClick={cancelCoolDown}
          sx={{ marginTop: theme.spacing(10) }}
        >
          <FormattedMessage defaultMessage={'Cancel Cooldown'} />
        </Button>
      )}
    </TransactionSidebar>
  );
};
