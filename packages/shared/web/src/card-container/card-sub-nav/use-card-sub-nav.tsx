import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useSelectedPortfolioNetwork } from '@notional-finance/notionable-hooks';
import { useLocation } from 'react-router-dom';

export interface CardSubNavProps {
  to: string;
  title: ReactNode;
}

export const useCardSubNav = () => {
  const { pathname } = useLocation();
  const network = useSelectedPortfolioNetwork();
  const links: CardSubNavProps[] = pathname.includes('borrow')
    ? [
        {
          title: <FormattedMessage defaultMessage={'Fixed Rate Borrowing'} />,
          to: `/borrow-fixed/${network}`,
        },
        {
          title: (
            <FormattedMessage defaultMessage={'Variable Rate Borrowing'} />
          ),
          to: `/borrow-variable/${network}`,
        },
      ]
    : [
        {
          title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
          to: `/lend-fixed/${network}`,
        },
        {
          title: <FormattedMessage defaultMessage={'Variable Rate Lending'} />,
          to: `/lend-variable/${network}`,
        },
        {
          title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
          to: `/liquidity-variable/${network}`,
        },
      ];

  const leveragedLinks: CardSubNavProps[] = [
    {
      title: <FormattedMessage defaultMessage={'Leveraged Vaults'} />,
      to: `/vaults/${network}`,
    },
    // {
    //   title: <FormattedMessage defaultMessage={'Leveraged Lending'} />,
    //   to: `/lend-leveraged/${network}`,
    // },
    {
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      to: `/liquidity-leveraged/${network}`,
    },
  ];
  return { links, leveragedLinks };
};

export default useCardSubNav;
