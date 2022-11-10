import { useEffect } from 'react';
import { Box, Divider } from '@mui/material';
import { google, outlook, office365, ics, CalendarEvent } from 'calendar-link';
import { TradeActionButton } from '@notional-finance/trade';
import {
  GoogleCalIcon,
  OutlookCalIcon,
  IcalIcon,
  CalAddIcon,
  MicrosoftCalIcon,
} from '@notional-finance/icons';
import { CountdownCards, Dropdown, H2, H3, HeadingSubtitle } from '@notional-finance/mui';
import { useHistory } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { useUnstakeAction } from './use-unstake-action';
import { messages } from '../messages';

export const UnstakeCoolDown = () => {
  const history = useHistory();
  const { redeemWindowBegin, redeemWindowEnd } = useUnstakeAction();

  const unstakeEvent: CalendarEvent = {
    start: redeemWindowBegin,
    end: redeemWindowEnd,
    duration: [1, 'hour'],
    title: 'Redeem Staked NOTE',
    description: "Don't forget to redeem your staked NOTE https://notional.finance/unstake",
    location: 'Internet',
  };

  const dropDownItems = [
    {
      label: 'Google',
      Icon: GoogleCalIcon,
      href: google(unstakeEvent),
    },
    {
      label: 'Microsoft',
      Icon: MicrosoftCalIcon,
      href: office365(unstakeEvent),
    },
    {
      label: 'Outlook',
      Icon: OutlookCalIcon,
      href: outlook(unstakeEvent),
    },
    {
      label: 'iCal',
      Icon: IcalIcon,
      href: ics(unstakeEvent),
    },
  ];

  useEffect(() => {
    history.push('/unstake/cooldown/');
  }, [history]);

  return (
    <>
      <H2>
        <FormattedMessage {...messages.unstake.coolDownHeading} />
      </H2>
      <HeadingSubtitle>
        <FormattedMessage {...messages.unstake.coolDownHelptext} />
      </HeadingSubtitle>
      <Box sx={{ textAlign: 'center' }}>
        <CountdownCards futureDate={redeemWindowBegin} totalDaysToCountDown={15} />
        <TradeActionButton
          canSubmit={true}
          width="60%"
          margin="35px 0px"
          buttonVariant="outlined"
          onSubmit={() => history.push(`/unstake/end-cooldown/?confirm=true`)}
          walletConnectedText={messages.unstake.cancelCoolDownCTA}
        />
      </Box>
      <Divider variant="fullWidth" />
      <H3>
        <FormattedMessage {...messages.unstake.coolDownCalendarHeader} />
      </H3>
      <Dropdown
        open={false}
        ButtonStartIcon={CalAddIcon}
        buttonTextAlign="left"
        dropDownItems={dropDownItems}
        buttonText={messages.unstake.coolDownCalendarText}
      />
    </>
  );
};
