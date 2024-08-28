import { styled, Box, Divider, useTheme } from '@mui/material';
import {
  LargeInputTextEmphasized,
  HeadingSubtitle,
  LabelValue,
  Caption,
  Body,
  Button,
  ErrorMessage,
} from '@notional-finance/mui';
import {
  Network,
  getDateString,
  getProviderFromNetwork,
} from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { PendingTransaction } from '@notional-finance/trade';
import { useCoolDownDrawer } from './hooks/use-cool-down-drawer';
import { useCallback } from 'react';
import {
  useAccountDefinition,
  useWalletConnectedNetwork,
  useTransactionStatus,
} from '@notional-finance/notionable-hooks';
import { SNOTEWeightedPool } from '@notional-finance/core-entities';

export const CoolDownDrawer = () => {
  const theme = useTheme();
  const account = useAccountDefinition(Network.mainnet);
  const { isReadOnlyAddress, onSubmit, transactionStatus, transactionHash } =
    useTransactionStatus(Network.mainnet);
  const { days, coolDownEnd, coolDownBegin } = useCoolDownDrawer();
  const walletConnectedNetwork = useWalletConnectedNetwork();
  const mustSwitchNetwork = Network.mainnet !== walletConnectedNetwork;

  const handleClick = useCallback(async () => {
    if (isReadOnlyAddress || !account) return;

    const populatedTxn = await SNOTEWeightedPool.sNOTE_Contract
      .connect(getProviderFromNetwork(Network.mainnet))
      .populateTransaction.startCoolDown();

    onSubmit('StartSNOTECooldown', populatedTxn);
  }, [isReadOnlyAddress, account, onSubmit]);

  return (
    <Box>
      <Box>
        <LargeInputTextEmphasized sx={{ marginBottom: theme.spacing(2) }}>
          <FormattedMessage defaultMessage={'Unstake and Redeem sNOTE'} />
        </LargeInputTextEmphasized>
        <HeadingSubtitle
          marginBottom={theme.spacing(3)}
          sx={{
            color: theme.palette.typography.light,
            display: { xs: 'none', sm: 'none', md: 'block' },
          }}
        >
          <FormattedMessage
            defaultMessage={
              'Unstaking your sNOTE requires a {days} day cooldown period. After you will have a 3 day window to redeem.  Learn More'
            }
            values={{
              days: days,
            }}
          />
        </HeadingSubtitle>
        <Divider
          sx={{
            marginBottom: theme.spacing(6),
            background: theme.palette.borders.paper,
            display: { xs: 'none', sm: 'none', md: 'block' },
          }}
          variant="fullWidth"
        />
      </Box>
      <Box>
        <ContentBox>
          <LabelValue sx={{ marginBottom: theme.spacing(3) }}>
            <FormattedMessage
              defaultMessage={'Begin cooldown for the following.'}
            />
          </LabelValue>
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
                {coolDownBegin
                  ? getDateString(coolDownBegin, {
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
                <FormattedMessage
                  defaultMessage={'Redemption window will end:'}
                />
              </Body>
              <LabelValue>
                {coolDownEnd
                  ? getDateString(coolDownEnd, {
                      showTime: true,
                      slashesFormat: true,
                    })
                  : '-'}
              </LabelValue>
            </Box>
          </Box>
        </ContentBox>
        <Caption>
          <FormattedMessage
            defaultMessage={
              'Your position is locked during cooldown with the option to cancel anytime.'
            }
          />
        </Caption>
      </Box>
      {mustSwitchNetwork && (
        <Box sx={{ height: theme.spacing(7), marginTop: theme.spacing(2) }}>
          <ErrorMessage
            variant="warning"
            title={<FormattedMessage defaultMessage={'Switch Network'} />}
            message={
              <FormattedMessage
                defaultMessage={'Switch your wallet to Mainnet to continue.'}
              />
            }
            maxWidth={'100%'}
            sx={{ marginTop: '0px' }}
          />
        </Box>
      )}

      {transactionHash && transactionStatus && (
        <PendingTransaction
          hash={transactionHash}
          transactionStatus={transactionStatus}
          selectedNetwork={walletConnectedNetwork}
        />
      )}
      <Button
        onClick={handleClick}
        variant="contained"
        size="large"
        sx={{ width: '100%', marginTop: theme.spacing(12) }}
        disabled={isReadOnlyAddress || mustSwitchNetwork}
      >
        <FormattedMessage
          defaultMessage={'Start {days} Day Cooldown'}
          values={{
            days: days,
          }}
        />
      </Button>
    </Box>
  );
};

const ContentBox = styled(Box)(
  ({ theme }) => `
    display: flex;
    justify-content: space-between;
    flex-direction: column;
    padding: ${theme.spacing(2)};
    margin-bottom: ${theme.spacing(2)};
    border-radius: ${theme.shape.borderRadius()};
    border: ${theme.shape.borderStandard};
    background: ${theme.palette.background.default};
    `
);
