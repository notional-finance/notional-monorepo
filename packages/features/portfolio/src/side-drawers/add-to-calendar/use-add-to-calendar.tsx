import { google, outlook, office365, ics, CalendarEvent } from 'calendar-link';
import { PORTFOLIO_CATEGORIES } from '@notional-finance/shared-config';
import {
  GoogleCalIcon,
  OutlookCalIcon,
  IcalIcon,
  MicrosoftCalIcon,
} from '@notional-finance/icons';
import { PortfolioParams } from '../../portfolio-feature-shell';
import { useIntl } from 'react-intl';
import { useParams } from 'react-router-dom';

export function useAddToCalendar(date: string) {
  const intl = useIntl();
  const { category } = useParams<PortfolioParams>();

  const calEvent: CalendarEvent = {
    start: date,
    duration: [1, 'hour'],
    title:
      category === PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS
        ? intl.formatMessage({ defaultMessage: 'Notional Vault Maturing' })
        : intl.formatMessage({ defaultMessage: 'Notional Loan Maturing' }),
    description:
      category === PORTFOLIO_CATEGORIES.LEVERAGED_VAULTS
        ? intl.formatMessage({
            defaultMessage:
              'Reminder to check in on your Notional Finance vault maturity',
          })
        : intl.formatMessage({
            defaultMessage: `Reminder to check in on your Notional Finance loan maturity`,
          }),
    location: 'notional.finance',
  };

  const calData = [
    {
      label: 'Google',
      Icon: GoogleCalIcon,
      href: google(calEvent),
    },
    {
      label: 'Microsoft',
      Icon: MicrosoftCalIcon,
      href: office365(calEvent),
    },
    {
      label: 'Outlook',
      Icon: OutlookCalIcon,
      href: outlook(calEvent),
    },
    {
      label: 'iCal',
      Icon: IcalIcon,
      href: ics(calEvent),
    },
  ];
  return calData;
}
