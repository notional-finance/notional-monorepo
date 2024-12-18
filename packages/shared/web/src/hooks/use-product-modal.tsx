import { PRODUCTS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import RiskScoreIndicator from '../card-container/card-table/risk-score-indicator/risk-score-indicator';
import { CheckmarkIcon } from '@notional-finance/icons';
import { useTheme } from '@mui/material';

export const useProductModal = () => {
  const theme = useTheme();

  const productModalContent = {
    [PRODUCTS.LEND_VARIABLE]: {
      title: <FormattedMessage defaultMessage={'Lending'} />,
      description: (
        <FormattedMessage
          defaultMessage={
            'This product offers variable, passive yield. No fees required, no risk of loss, and position is redeemable anytime.'
          }
        />
      ),
      productDetails: [
        {
          title: 'TXN Fees',
          textValue: 'No',
        },
        {
          title: 'Collateral',
          compValue: (
            <CheckmarkIcon sx={{ fill: theme.palette.primary.light }} />
          ),
        },
        {
          title: 'Risk Score',
          compValue: (
            <RiskScoreIndicator riskLevel="veryLow" hideText showThemeColors />
          ),
        },
      ],
    },
    [PRODUCTS.LEND_FIXED]: {
      title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
      description: (
        <FormattedMessage
          defaultMessage={
            'This product guarantees yield if held to maturity. Early withdrawals are subject to liquidity availability. Upon maturity, the loan automatically transitions to variable-rate lending if not withdrawn.'
          }
        />
      ),
      productDetails: [
        {
          title: 'TXN Fees',
          textValue: 'Yes',
        },
        {
          title: 'Collateral',
          compValue: (
            <CheckmarkIcon sx={{ fill: theme.palette.primary.light }} />
          ),
        },
        {
          title: 'Risk Score',
          compValue: (
            <RiskScoreIndicator riskLevel="veryLow" hideText showThemeColors />
          ),
        },
      ],
    },
    [PRODUCTS.LIQUIDITY_VARIABLE]: {
      title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
      description: (
        <FormattedMessage
          defaultMessage={`This product earns passive yield by providing liquidity to Notional's fixed rate markets. Assets earn interest, fees, and NOTE incentives. Redemption anytime subject to liquidity.`}
        />
      ),
      productDetails: [
        {
          title: 'TXN Fees',
          textValue: 'Yes',
        },
        {
          title: 'Collateral',
          compValue: (
            <CheckmarkIcon sx={{ fill: theme.palette.primary.light }} />
          ),
        },
        {
          title: 'Risk Score',
          compValue: (
            <RiskScoreIndicator riskLevel="low" hideText showThemeColors />
          ),
        },
      ],
    },

    [PRODUCTS.LIQUIDITY_LEVERAGED]: {
      title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
      description: (
        <FormattedMessage
          defaultMessage={`<p>This product provides liquidity using leverage sourced from Notional, earning both organic yield and NOTE incentives. It earns yield from providing fixed rate liquidity - the interest, fixed rate trading fees, and NOTE incentives.</p>
              <p>Risks include: IL risk, negative APY risk, and liquidity risk. It's best for users that want to earn maximum NOTE incentives and hold the position for the medium-term.</p>`}
          values={{
            // Required when using HTML tags
            p: (chunks: any) => <p>{chunks}</p>,
          }}
        />
      ),
      productDetails: [
        {
          title: 'Yield Type',
          textValue: 'Organic + NOTE',
        },
        {
          title: 'Risk Score',
          compValue: (
            <RiskScoreIndicator riskLevel="medium" hideText showThemeColors />
          ),
        },
      ],
    },
    [PRODUCTS.LEVERAGED_YIELD_FARMING]: {
      title: <FormattedMessage defaultMessage={'Leveraged Yield Farming'} />,
      description: (
        <FormattedMessage
          defaultMessage={`<p>This product earns yield from providing liquidity on pegged-asset liquidity pools on Balancer and Curve. Leverage comes from Notional, deploys into a liquidity pool, and then harvests and auto-reinvests the earned incentives.</p>
                <p>This strategy pays organic yield in the deposit token. This is a good strategy for active users who want to maximize their APY and are comfortable with APY volatility.</p>`}
          values={{
            p: (chunks: any) => <p>{chunks}</p>,
          }}
        />
      ),
      productDetails: [
        {
          title: 'Yield Type',
          textValue: 'Organic',
        },
        {
          title: 'Risk Score',
          compValue: (
            <RiskScoreIndicator riskLevel="low" hideText showThemeColors />
          ),
        },
      ],
    },
    [PRODUCTS.LEVERAGED_POINTS_FARMING]: {
      title: <FormattedMessage defaultMessage={'Leveraged Points Farming'} />,
      description: (
        <FormattedMessage
          defaultMessage={`<p>This product earns points from partner protocols + yield from providing liquidity on pegged-asset liquidity pools on Balancer and Curve.</p>
                <p>Leveraged points farming is the same as leveraged yield farming but you also get leveraged points!</p>`}
          values={{
            p: (chunks: any) => <p>{chunks}</p>,
          }}
        />
      ),
      productDetails: [
        {
          title: 'Yield Type',
          textValue: 'Points',
        },
        {
          title: 'Risk Score',
          compValue: (
            <RiskScoreIndicator riskLevel="low" hideText showThemeColors />
          ),
        },
      ],
    },
    [PRODUCTS.LEVERAGED_PENDLE]: {
      title: <FormattedMessage defaultMessage={'Leveraged Pendle'} />,
      description: (
        <FormattedMessage
          defaultMessage={`<p>This product earns fixed yield from Pendle PTs with leverage. This strategy borrows from Notional at a fixed or variable rate and then buys a specific PT on Pendle.</p>
              <p>This strategy gives organic yield paid in the deposit token (ex USDC) even if the PT is based in a different token (ex USDe).</p>`}
          values={{
            p: (chunks: any) => <p>{chunks}</p>,
          }}
        />
      ),
      productDetails: [
        {
          title: 'Yield Type',
          textValue: 'Organic',
        },
        {
          title: 'Risk Score',
          compValue: (
            <RiskScoreIndicator riskLevel="medium" hideText showThemeColors />
          ),
        },
      ],
    },
    [PRODUCTS.BORROW_FIXED]: {
      title: <FormattedMessage defaultMessage={'Fixed Rate Borrowing'} />,
      description: (
        <FormattedMessage
          defaultMessage={`<p>This product borrows against your crypto at a guaranteed rate if held to maturity. Collateral is required. Fixed Rate Lending, Lending, Provide Liquidity, and Leveraged Liquidity positions are automatically counted as collateral.</p>
              <p>Liquidation occurs if the value of collateral falls below the liquidation price.</p>`}
          values={{
            p: (chunks: any) => <p>{chunks}</p>,
          }}
        />
      ),
      productDetails: [
        {
          title: 'TXN Fees',
          textValue: 'Yes',
        },
        {
          title: 'Redeemable Anytime',
          compValue: (
            <CheckmarkIcon sx={{ fill: theme.palette.primary.light }} />
          ),
        },
      ],
    },
    [PRODUCTS.BORROW_VARIABLE]: {
      title: <FormattedMessage defaultMessage={'Borrowing'} />,
      description: (
        <FormattedMessage
          defaultMessage={`<p>This product borrows against your crypto at a variable rate. Collateral is required. Fixed Rate Lending, Lending, Provide Liquidity, and Leveraged Liquidity positions are automatically counted as collateral.</p>
              <p>Liquidation occurs if the value of collateral falls below the liquidation price.</p>`}
          values={{
            p: (chunks: any) => <p>{chunks}</p>,
          }}
        />
      ),
      productDetails: [
        {
          title: 'TXN Fees',
          textValue: 'Yes',
        },
        {
          title: 'Redeemable Anytime',
          compValue: (
            <CheckmarkIcon sx={{ fill: theme.palette.primary.light }} />
          ),
        },
      ],
    },
  };

  return productModalContent;
};
