import { FormattedMessage } from 'react-intl';

export const useAuditLinks = () => {
  const auditLinks = [
    {
      name: (
        <FormattedMessage defaultMessage={'External Lending, Wrapped fCash'} />
      ),
      date: <FormattedMessage defaultMessage={'Jan 2024'} />,
      route: 'https://audits.sherlock.xyz/contests/142',
    },
    {
      name: (
        <FormattedMessage defaultMessage={'Single Sided LP Leverage Vaults'} />
      ),
      date: <FormattedMessage defaultMessage={'Dec 2023'} />,
      route: 'https://audits.sherlock.xyz/contests/119',
    },

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
  ];

  return auditLinks;
};

export default useAuditLinks;
