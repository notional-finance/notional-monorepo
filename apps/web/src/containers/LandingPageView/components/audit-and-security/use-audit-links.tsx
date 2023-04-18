import { FormattedMessage } from 'react-intl';

export const useAuditLinks = () => {
  const auditLinks = [
    {
      name: <FormattedMessage defaultMessage={'Notional V3, Sherlock'} />,
      date: <FormattedMessage defaultMessage={'May 2023'} />,
      route: 'https://app.sherlock.xyz/audits/contests/59',
    },
    {
      name: (
        <FormattedMessage defaultMessage={'Convex Leveraged Vault, Sherlock'} />
      ),
      date: <FormattedMessage defaultMessage={'Mar 2023'} />,
      route: 'https://app.sherlock.xyz/audits/contests/52',
    },
    {
      name: (
        <FormattedMessage
          defaultMessage={'Balancer Vault Strategy Fixes, Sherlock'}
        />
      ),
      date: <FormattedMessage defaultMessage={'Jan 2023'} />,
      route: 'https://app.sherlock.xyz/audits/contests/31',
    },
    {
      name: (
        <FormattedMessage
          defaultMessage={
            'Leveraged Vaults + Balancer Vault Strategy, Sherlock'
          }
        />
      ),
      date: <FormattedMessage defaultMessage={'Oct 2022'} />,
      route: 'https://app.sherlock.xyz/audits/contests/2',
    },
  ];

  return auditLinks;
};

export default useAuditLinks;
