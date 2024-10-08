import { useLocation } from 'react-router-dom';
import { CheckmarkIcon } from '@notional-finance/icons';
import { HeadingSubtitle } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { RiskScoreIndicator } from './risk-score-indicator/risk-score-indicator';
import { PRODUCTS } from '@notional-finance/util';

export const useCardTable = () => {
  const { pathname } = useLocation();
  const [_, routeKey] = pathname.split('/');

  switch (routeKey as PRODUCTS) {
    case PRODUCTS.LEND_FIXED:
      return [
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Redeemable Anytime" />
            </HeadingSubtitle>
          ),
          value: <CheckmarkIcon />,
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Can Be Collateral" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Yes" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="NOTE Incentives" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="No" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Transaction Fees" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Yes" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Risk Score" />
            </HeadingSubtitle>
          ),
          value: <RiskScoreIndicator riskLevel="veryLow" />,
        },
      ];
    case PRODUCTS.LEND_VARIABLE:
      return [
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Redeemable Anytime" />
            </HeadingSubtitle>
          ),
          value: <CheckmarkIcon />,
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Can Be Collateral" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Yes" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="NOTE Incentives" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="No" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Transaction Fees" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="No" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Risk Score" />
            </HeadingSubtitle>
          ),
          value: <RiskScoreIndicator riskLevel="veryLow" />,
        },
      ];
    case PRODUCTS.LEND_LEVERAGED:
      return [
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Redeemable Anytime" />
            </HeadingSubtitle>
          ),
          value: <CheckmarkIcon />,
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="NOTE Incentives" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="No" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Transaction Fees" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Yes" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Risk Score" />
            </HeadingSubtitle>
          ),
          value: <RiskScoreIndicator riskLevel="high" />,
        },
      ];
    case PRODUCTS.LEVERAGED_POINTS_FARMING:
      return [
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Yield Type" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Points" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Liquidity Risk" />
            </HeadingSubtitle>
          ),
          value: <RiskScoreIndicator riskLevel="low" />,
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="IL Risk" />
            </HeadingSubtitle>
          ),
          value: <RiskScoreIndicator riskLevel="low" />,
        },
      ];
    case PRODUCTS.LEVERAGED_YIELD_FARMING:
      return [
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Yield Type" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Organic" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Liquidity Risk" />
            </HeadingSubtitle>
          ),
          value: <RiskScoreIndicator riskLevel="low" />,
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="IL Risk" />
            </HeadingSubtitle>
          ),
          value: <RiskScoreIndicator riskLevel="low" />,
        },
      ];
    case PRODUCTS.LIQUIDITY_VARIABLE:
      return [
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Redeemable Anytime" />
            </HeadingSubtitle>
          ),
          value: <CheckmarkIcon />,
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Can Be Collateral" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Yes" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="NOTE Incentives" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Yes" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Transaction Fees" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Yes" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Risk Score" />
            </HeadingSubtitle>
          ),
          value: <RiskScoreIndicator riskLevel="low" />,
        },
      ];
    case PRODUCTS.LIQUIDITY_LEVERAGED:
      return [
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Yield Type" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Organic + NOTE" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Liquidity Risk" />
            </HeadingSubtitle>
          ),
          value: <RiskScoreIndicator riskLevel="medium" />,
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="IL Risk" />
            </HeadingSubtitle>
          ),
          value: <RiskScoreIndicator riskLevel="medium" />,
        },
      ];
    case PRODUCTS.BORROW_FIXED:
    case PRODUCTS.BORROW_VARIABLE:
      return [
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Redeemable Anytime" />
            </HeadingSubtitle>
          ),
          value: <CheckmarkIcon />,
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Transaction Fees" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Yes" />
            </HeadingSubtitle>
          ),
        },
      ];
    case PRODUCTS.LEVERAGED_PENDLE:
      return [
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Yield Type" />
            </HeadingSubtitle>
          ),
          value: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Organic" />
            </HeadingSubtitle>
          ),
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="Liquidity Risk" />
            </HeadingSubtitle>
          ),
          value: <RiskScoreIndicator riskLevel="medium" />,
        },
        {
          key: (
            <HeadingSubtitle>
              <FormattedMessage defaultMessage="IL Risk" />
            </HeadingSubtitle>
          ),
          value: <RiskScoreIndicator riskLevel="medium" />,
        },
      ];
    default:
      throw Error('Invalid product');
  }
};

export default useCardTable;
