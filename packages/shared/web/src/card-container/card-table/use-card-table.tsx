import { useLocation } from 'react-router-dom';
import { CheckmarkIcon } from '@notional-finance/icons';
import { HeadingSubtitle } from '@notional-finance/mui';
import { FormattedMessage } from 'react-intl';
import { RiskScoreIndicator } from './risk-score-indicator/risk-score-indicator';

export const useCardTable = () => {
  const { pathname } = useLocation();

  switch (pathname) {
    case '/lend-fixed':
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
    case '/lend-variable':
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
    case '/vaults':
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
              <FormattedMessage defaultMessage="No" />
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
          value: <RiskScoreIndicator riskLevel="high" />,
        },
      ];
    case '/provide':
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
    case '/borrow':
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
              <FormattedMessage defaultMessage="Yes" />
            </HeadingSubtitle>
          ),
        },
      ];
  }
};

export default useCardTable;
