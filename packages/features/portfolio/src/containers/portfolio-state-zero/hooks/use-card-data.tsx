import { useTheme } from '@mui/material';
import {
  BarChartIcon,
  BarChartLateralIcon,
  CheckmarkIcon,
  CoinsCircleIcon,
  CoinsIcon,
  PieChartIcon,
  PointsIcon,
  VaultIcon,
} from '@notional-finance/icons';
import { useSelectedNetwork } from '@notional-finance/notionable-hooks';
import { PORTFOLIO_STATE_ZERO_OPTIONS, PRODUCTS } from '@notional-finance/util';
import { FormattedMessage } from 'react-intl';
import { sumAndFormatIncentives } from '@notional-finance/shared-web/dashboard-view/hooks/utils';
import { getAvailableVaults } from './use-network-token-data';
import { StateZeroItemType } from '@notional-finance/notionable';
import RiskScoreIndicator from '@notional-finance/shared-web/card-container/card-table/risk-score-indicator/risk-score-indicator';

export const useCardData = (
  selectedTabIndex: number,
  activeToken: string,
  tokenData: any[],
  productGroupData: StateZeroItemType | []
) => {
  const theme = useTheme();
  const selectedNetwork = useSelectedNetwork();

  let cardData: any[] = [];

  if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.EARN) {
    const primeCashData = tokenData[0];
    const fCashData = tokenData[1];
    const nTokenData = tokenData[2];
    cardData = [
      {
        accentTitle: <FormattedMessage defaultMessage={'Passive Yield'} />,
        title: <FormattedMessage defaultMessage={'Lending'} />,
        icon: <BarChartIcon />,
        apy: primeCashData?.apy?.totalAPY,
        symbol: activeToken,
        cardLink: `/lend-variable/${selectedNetwork}/${activeToken}`,
        bottomLink: `/lend-variable/${selectedNetwork}`,
        bottomText: 'All Lending',
        pillData: [
          <FormattedMessage defaultMessage={'No Risk of Loss'} />,
          <FormattedMessage defaultMessage={'No Fee'} />,
          <FormattedMessage defaultMessage={'Always Redeemable'} />,
        ],
        modalContent: {
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
                <RiskScoreIndicator
                  riskLevel="veryLow"
                  hideText
                  showThemeColors
                />
              ),
            },
          ],
        },
      },
      {
        accentTitle: <FormattedMessage defaultMessage={'Guaranteed Yield'} />,
        title: <FormattedMessage defaultMessage={'Fixed Rate Lending'} />,
        icon: <BarChartLateralIcon />,
        apy: fCashData?.apy?.totalAPY,
        apyTitle: <FormattedMessage defaultMessage={'As High As'} />,
        symbol: activeToken,
        cardLink: `/lend-fixed/${selectedNetwork}/${activeToken}`,
        bottomLink: `/lend-fixed/${selectedNetwork}`,
        bottomText: 'All Fixed Rate Lending',
        pillData: [
          <FormattedMessage
            defaultMessage={'Early Exit Subject to Liquidity'}
          />,
        ],
        modalContent: {
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
                <RiskScoreIndicator
                  riskLevel="veryLow"
                  hideText
                  showThemeColors
                />
              ),
            },
          ],
        },
      },
      {
        accentTitle: <FormattedMessage defaultMessage={'High yield'} />,
        title: <FormattedMessage defaultMessage={'Provide Liquidity'} />,
        icon: <PieChartIcon />,
        apy: nTokenData?.apy?.totalAPY,
        apyTitle:
          nTokenData?.apy?.incentives &&
          nTokenData?.apy?.incentives?.length > 0 ? (
            <FormattedMessage
              defaultMessage={'{incentiveAPY} Incentive APY'}
              values={{
                incentiveAPY: sumAndFormatIncentives(nTokenData.apy.incentives),
              }}
            />
          ) : (
            <FormattedMessage defaultMessage={'As High As'} />
          ),
        isTotalAPYSuffix:
          (nTokenData?.apy?.incentives &&
            nTokenData?.apy?.incentives?.length > 0) ??
          false,
        symbol: activeToken,
        cardLink: `/liquidity-variable/${selectedNetwork}/${activeToken}`,
        bottomLink: `/liquidity-variable/${selectedNetwork}`,
        bottomText: 'All Provide Liquidity',
        pillData: [
          <FormattedMessage defaultMessage={'Incentives'} />,
          <FormattedMessage defaultMessage={'Possible IL'} />,
          <FormattedMessage defaultMessage={'Possible Illiquidity'} />,
        ],
        modalContent: {
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
      },
    ];
  } else if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.LEVERAGE) {
    const leveragedNToken = tokenData[0];
    const farmingVault = tokenData[1];
    const pointsVault = tokenData[2];

    cardData = [
      {
        accentTitle: <FormattedMessage defaultMessage={'NOTE Yield'} />,
        title: <FormattedMessage defaultMessage={'Leveraged Liquidity'} />,
        icon: <PieChartIcon />,
        apy: leveragedNToken?.apy?.totalAPY,
        apyTitle: leveragedNToken?.apy.incentives ? (
          <FormattedMessage
            defaultMessage={'{incentiveAPY} Incentive APY'}
            values={{
              incentiveAPY: sumAndFormatIncentives(
                leveragedNToken?.apy.incentives
              ),
            }}
          />
        ) : (
          <FormattedMessage defaultMessage={'As High As'} />
        ),
        isTotalAPYSuffix:
          leveragedNToken?.apy.incentives &&
          leveragedNToken?.apy.incentives.length > 0,
        symbol: activeToken,
        cardLink: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}/CreateLeveragedNToken/${activeToken}?borrowOption=${leveragedNToken?.debtToken?.id}`,
        bottomValue: `Max Leverage: ${leveragedNToken?.maxLeverageRatio?.toFixed(
          2
        )}x`,
        bottomLink: `/${PRODUCTS.LIQUIDITY_LEVERAGED}/${selectedNetwork}`,
        bottomText: 'All Leveraged Liquidity',
        pillData: [
          <FormattedMessage defaultMessage={'Max NOTE Incentives'} />,
          <FormattedMessage defaultMessage={'Possible Illiquidity'} />,
        ],
        modalContent: {
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
                <RiskScoreIndicator
                  riskLevel="medium"
                  hideText
                  showThemeColors
                />
              ),
            },
          ],
        },
      },
      {
        accentTitle: <FormattedMessage defaultMessage={'Organic Yield'} />,
        title: <FormattedMessage defaultMessage={'Leveraged Yield Farm'} />,
        icon: <VaultIcon />,
        apy: farmingVault?.apy?.totalAPY,
        apyTitle: <FormattedMessage defaultMessage={'As High As'} />,
        symbol: activeToken,
        availableSymbols:
          productGroupData[1]?.length > 0
            ? getAvailableVaults(productGroupData[1])
            : [],
        cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${farmingVault?.vaultAddress}/CreateVaultPosition?borrowOption=${farmingVault?.debtTokenId}`,
        bottomValue: `Max Leverage: ${farmingVault?.maxLeverageRatio?.toFixed(
          2
        )}x`,
        bottomLink: `/${PRODUCTS.LEVERAGED_YIELD_FARMING}/${selectedNetwork}`,
        bottomText: 'All Leveraged Yield Farming',
        pillData: [
          <FormattedMessage defaultMessage={'Low IL'} />,
          <FormattedMessage defaultMessage={'Pegged Asset Pools'} />,
        ],
        modalContent: {
          title: (
            <FormattedMessage defaultMessage={'Leveraged Points Farming'} />
          ),
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
      },
      {
        accentTitle: <FormattedMessage defaultMessage={'Points Yield'} />,
        title: <FormattedMessage defaultMessage={'Leveraged Points Farm'} />,
        icon: <PointsIcon fill={theme.palette.typography.main} />,
        apy: pointsVault?.apy?.totalAPY,
        apyTitle: <FormattedMessage defaultMessage={'As High as'} />,
        symbol: activeToken,
        availableSymbols:
          productGroupData[2]?.length > 0
            ? getAvailableVaults(productGroupData[2])
            : [],
        cardLink: `/${PRODUCTS.VAULTS}/${selectedNetwork}/${pointsVault?.vaultAddress}/CreateVaultPosition?borrowOption=${pointsVault?.debtTokenId}`,
        bottomValue: `Max Leverage: ${pointsVault?.maxLeverageRatio?.toFixed(
          2
        )}x`,
        bottomLink: `/${PRODUCTS.LEVERAGED_POINTS_FARMING}/${selectedNetwork}`,
        bottomText: 'All Leveraged Points Farming',
        pillData: [
          <FormattedMessage defaultMessage={'Low IL'} />,
          <FormattedMessage defaultMessage={'Pegged Asset Pools'} />,
        ],
        modalContent: {
          title: (
            <FormattedMessage defaultMessage={'Leveraged Points Farming'} />
          ),
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
      },
    ];
  } else if (selectedTabIndex === PORTFOLIO_STATE_ZERO_OPTIONS.BORROW) {
    const primeDebtData = tokenData[0];
    const fCashDebtData = tokenData[1];

    cardData = [
      {
        accentTitle: <FormattedMessage defaultMessage={'Passive Interest'} />,
        title: <FormattedMessage defaultMessage={'Borrowing'} />,
        icon: <CoinsCircleIcon />,
        apy: primeDebtData?.apy?.totalAPY,
        apyTitle: <FormattedMessage defaultMessage={'As Low As'} />,
        symbol: activeToken,
        cardLink: `/borrow-variable/${selectedNetwork}/${activeToken}`,
        // bottomValue: 'Max LTV: 75%', TODO: Add this back in when we have the data
        bottomLink: `/borrow-variable/${selectedNetwork}`,
        bottomText: 'All Borrowing',
        pillData: [
          <FormattedMessage defaultMessage={'Fully Flexible'} />,
          <FormattedMessage defaultMessage={'Exit Anytime at No Cost'} />,
        ],
        modalContent: {
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
      },
      {
        accentTitle: (
          <FormattedMessage defaultMessage={'Guaranteed Interest'} />
        ),
        title: <FormattedMessage defaultMessage={'Fixed Rate Borrowing'} />,
        icon: (
          <CoinsIcon
            sx={{
              fill: 'transparent !important',
              stroke: theme.palette.typography.main,
            }}
          />
        ),
        apy: fCashDebtData?.apy?.totalAPY,
        apyTitle: <FormattedMessage defaultMessage={'As Low As'} />,
        symbol: activeToken,
        cardLink: `/borrow-fixed/${selectedNetwork}/${activeToken}`,
        // bottomValue: 'Max LTV: 75%', TODO: Add this back in when we have the data
        bottomLink: `/borrow-fixed/${selectedNetwork}`,
        bottomText: 'All Fixed Rate Borrowing',
        pillData: [
          <FormattedMessage defaultMessage={'Exit Anytime'} />,
          <FormattedMessage defaultMessage={'Entry and Early Exit Fees'} />,
        ],
        modalContent: {
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
      },
    ];
  }

  return cardData;
};
