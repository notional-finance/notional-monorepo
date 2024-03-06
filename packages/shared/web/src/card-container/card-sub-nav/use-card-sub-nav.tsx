import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';

export interface CardSubNavProps {
  to: string;
  title: ReactNode;
  key: string;
}

export const useCardSubNav = () => {
  const { pathname } = useLocation();
  const selectedNetwork = useSelectedNetwork();
  const links: CardSubNavProps[] = pathname.includes('borrow')
    ? [
        {
          title: <FormattedMessage defaultMessage={'Fixed Rate Borrowing'} />,
          to: `/borrow-fixed/${selectedNetwork}`,
          key: 'borrow-fixed',
        },
        {
          title: (
            <FormattedMessage defaultMessage={'Variable Rate Borrowing'} />
          ),
          to: `/borrow-variable/${selectedNetwork}`,
          key: 'borrow-variable',
        },
      ]
    : [
        {
          title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
          to: `/lend-fixed/${selectedNetwork}`,
          key: 'lend-fixed',
        },
        {
          title: <FormattedMessage defaultMessage={'Variable Rate Lending'} />,
          to: `/lend-variable/${selectedNetwork}`,
          key: 'lend-variable',
        },
        {
          title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
          to: `/liquidity-variable/${selectedNetwork}`,
          key: 'liquidity-variable',
        },
      ];

  const leveragedLinks: CardSubNavProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      to: `/vaults/${selectedNetwork}`,
      key: 'vaults',
    },
    // {
    //   title: <FormattedMessage defaultMessage={'Leveraged Lending'} />,
    //   to: `/lend-leveraged/${selectedNetwork}`,
    // },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      to: `/liquidity-leveraged/${selectedNetwork}`,
      key: 'liquidity-leveraged',
    },
  ];
  return { links, leveragedLinks };
};

export default useCardSubNav;
