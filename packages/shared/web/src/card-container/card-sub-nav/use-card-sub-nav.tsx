import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { PRODUCTS } from '@notional-finance/util';
import { ReactNode } from 'react';
import { FormattedMessage } from 'react-intl';
import { useLocation } from 'react-router-dom';

export interface CardSubNavProps {
  to: string;
  title: ReactNode;
  key: string;
}

export const useCardSubNav = (): CardSubNavProps[] => {
  const { pathname } = useLocation();
  const selectedNetwork = useSelectedNetwork();
  if (pathname.includes('borrow')) {
    return [
      {
        title: <FormattedMessage defaultMessage={'Borrowing'} />,
        to: `/${PRODUCTS.BORROW_VARIABLE}/${selectedNetwork}`,
        key: PRODUCTS.BORROW_VARIABLE,
      },
      {
        title: <FormattedMessage defaultMessage={'Fixed Rate Borrowing'} />,
        to: `/${PRODUCTS.BORROW_FIXED}/${selectedNetwork}`,
        key: PRODUCTS.BORROW_FIXED,
      },
    ];
  } else if (
    pathname.includes(PRODUCTS.LEND_FIXED) ||
    pathname.includes(PRODUCTS.LEND_VARIABLE) ||
    pathname.includes(PRODUCTS.LIQUIDITY_VARIABLE)
  ) {
    return [
      {
        title: <FormattedMessage defaultMessage={'Lending'} />,
        to: `/${PRODUCTS.LEND_VARIABLE}/${selectedNetwork}`,
        key: PRODUCTS.LEND_VARIABLE,
      },
      {
        title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
        to: `/${PRODUCTS.LEND_FIXED}/${selectedNetwork}`,
        key: PRODUCTS.LEND_FIXED,
      },
      {
        title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
        to: `/${PRODUCTS.LIQUIDITY_VARIABLE}/${selectedNetwork}`,
        key: PRODUCTS.LIQUIDITY_VARIABLE,
      },
    ];
  } else {
    return [
      {
        title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
        to: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}`,
        key: PRODUCTS.LIQUIDITY_LEVERAGED,
      },
      {
        title: <FormattedMessage defaultMessage={'Leveraged Yield Farming'} />,
        to: `/${PRODUCTS.LEVERAGED_YIELD_FARMING}/${selectedNetwork}`,
        key: PRODUCTS.LEVERAGED_YIELD_FARMING,
      },
      {
        title: <FormattedMessage defaultMessage={'Leveraged Points Farming'} />,
        to: `/${PRODUCTS.LEVERAGED_POINTS_FARMING}/${selectedNetwork}`,
        key: PRODUCTS.LEVERAGED_POINTS_FARMING,
      },
      {
        title: <FormattedMessage defaultMessage={'Leveraged Pendle'} />,
        to: `/${PRODUCTS.LEVERAGED_PENDLE}/${selectedNetwork}`,
        key: PRODUCTS.LEVERAGED_PENDLE,
      },
    ];
  }
};

export default useCardSubNav;
