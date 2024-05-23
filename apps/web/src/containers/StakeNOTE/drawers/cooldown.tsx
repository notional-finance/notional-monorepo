import { useContext } from 'react';
import { NOTEContext } from '..';
import { Box, useTheme } from '@mui/material';
import { TransactionSidebar } from '@notional-finance/trade';
import { FormattedMessage } from 'react-intl';
import {
  Body,
  LabelValue,
  CountdownCards,
  Caption,
} from '@notional-finance/mui';
import { useAccountDefinition } from '@notional-finance/notionable-hooks';
import { Network, getDateString } from '@notional-finance/util';

export const CoolDown = () => {
  const theme = useTheme();
  const context = useContext(NOTEContext);
  const account = useAccountDefinition(Network.mainnet);
  const stakeNoteStatus = account?.stakeNOTEStatus;

  const redeemWindowBeginDate = stakeNoteStatus?.redeemWindowBegin
    ? new Date(stakeNoteStatus.redeemWindowBegin * 1000)
    : null;

  return (
    <TransactionSidebar
      riskComponent={<div />}
      context={context}
      showDrawer
      mobileTopMargin={theme.spacing(16)}
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
    </TransactionSidebar>
  );
};
