import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelectedPortfolioNetwork } from '@notional-finance/notionable-hooks';
import { useLocation } from 'react-router-dom';

export interface CardSubNavProps {
  to: string;
  title: ReactNode;
  key: string;
}

export const useCardSubNav = () => {
  const { pathname } = useLocation();
  const network = useSelectedPortfolioNetwork();
  const links: CardSubNavProps[] = pathname.includes('borrow')
    ? [
        {
          title: <FormattedMessage defaultMessage={'Fixed Rate Borrowing'} />,
          to: `/borrow-fixed/${network}`,
          key: 'borrow-fixed',
        },
        {
          title: (
            <FormattedMessage defaultMessage={'Variable Rate Borrowing'} />
          ),
          to: `/borrow-variable/${network}`,
          key: 'borrow-variable',
        },
      ]
    : [
        {
          title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
          to: `/lend-fixed/${network}`,
          key: 'lend-fixed',
        },
        {
          title: <FormattedMessage defaultMessage={'Variable Rate Lending'} />,
          to: `/lend-variable/${network}`,
          key: 'lend-variable',
        },
        {
          title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
          to: `/liquidity-variable/${network}`,
          key: 'liquidity-variable',
        },
      ];

  const leveragedLinks: CardSubNavProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      to: `/vaults/${network}`,
      key: 'vaults',
    },
    // {
    //   title: <FormattedMessage defaultMessage={'Leveraged Lending'} />,
    //   to: `/lend-leveraged/${network}`,
    // },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      to: `/liquidity-leveraged/${network}`,
      key: 'liquidity-leveraged',
    },
  ];
  return { links, leveragedLinks };
};

export default useCardSubNav;
