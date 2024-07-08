import { useLocation } from 'react-router-dom';
import { CheckmarkIcon } from '@notional-finance/icons';
import { HeadingSubtitle } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { RiskScoreIndicator } from './risk-score-indicator/risk-score-indicator';

export const useCardTable = () => {
  const { pathname } = useLocation();
  const [_, routeKey] = pathname.split('/');

  switch (routeKey) {
    case 'lend-fixed':
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
    case 'lend-variable':
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
    case 'lend-leveraged':
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
    case 'leveraged-points-farming':
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
    case 'leveraged-yield-farming':
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
    case 'liquidity-variable':
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
    case 'liquidity-leveraged':
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
    case 'borrow-fixed':
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
    default:
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
              <FormattedMessage defaultMessage="No" />
            </HeadingSubtitle>
          ),
        },
      ];
  }
};

export default useCardTable;
