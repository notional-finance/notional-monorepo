import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  styled,
  useTheme,
} from '@mui/material';
import { TokenBalance } from '@notional-finance/core-entities';
import { formatNumberAsPercent } from '@notional-finance/helpers';
import { ArrowIcon } from '@notional-finance/icons';
import {
  H4,
  Label,
  LabelValue,
  LinkText,
  PageLoading,
  SliderRisk,
} from '@notional-finance/mui';
import {
  useAccountReady,
  useFiat,
  usePortfolioRiskProfile,
} from '@notional-finance/notionable-hooks';
import { useState } from 'react';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';

const Container = styled(Box)(
  ({ theme }) => `
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  margin-bottom: ${theme.spacing(3)};
`
);

const RiskHeaderBox = styled(Box)(
  ({ theme }) => `
  border-radius: ${theme.shape.borderRadius()};
  padding: ${theme.spacing(3)};
  background: ${theme.palette.background.paper};
`
);

const LiquidationPriceExpander = styled(AccordionSummary)(
  ({ theme }) => `
  padding: ${theme.spacing(2, 3)};
  background: ${theme.palette.background.paper};
  border-top: ${theme.shape.borderStandard};
  display: flex;
  justify-content: space-between;
  cursor: pointer;
`
);

const LiquidationPriceTables = styled(AccordionDetails)(
  ({ theme }) => `
  padding: ${theme.spacing(3)};
  background: ${theme.palette.background.default};
  border-bottom-left-radius: ${theme.shape.borderRadius()};
  border-bottom-right-radius: ${theme.shape.borderRadius()};
`
);

const LabelAndValue = ({
  label,
  value,
}: {
  label: MessageDescriptor;
  value: string;
}) => {
  return (
    <Box>
      <Label msg={label} />
      <LabelValue>{value}</LabelValue>
    </Box>
  );
};

const getPriceDistance = (current: TokenBalance, liquidation: TokenBalance) => {
  if (current.isZero()) return 0;
  return (
    (100 * (current.toFloat() - liquidation.toFloat())) / current.toFloat()
  );
};

export const PortfolioRisk = () => {
  const theme = useTheme();
  const [isExpanded, setExpanded] = useState(false);
  const isAccountReady = useAccountReady();
  const profile = usePortfolioRiskProfile();
  const baseCurrency = useFiat();
  const loanToValue = profile.loanToValue();
  const liquidationPrices = profile.getAllLiquidationPrices({
    onlyUnderlyingDebt: false,
  });
  const healthFactor = profile.healthFactor();
  const exchangeRateRisk = liquidationPrices
    .filter(
      ({ riskExposure, debt, collateral, price }) =>
        riskExposure?.isCrossCurrencyRisk &&
        debt.tokenType === 'Underlying' &&
        collateral.tokenType === 'Underlying' &&
        price !== null
    )
    .flatMap(({ collateral, debt, price }) => {
      const collateralPrice =
        TokenBalance.unit(collateral).toFiat(baseCurrency);
      const collateralLiquidationPrice = price.toFiat(baseCurrency);
      const debtPrice = TokenBalance.unit(debt).toFiat(baseCurrency);
      const debtLiquidationPrice = price.toFiat(baseCurrency);

      return [
        {
          label: `${collateral.symbol} / ${baseCurrency}`,
          currentPrice: collateralPrice.toDisplayStringWithSymbol(3),
          dayChange: 0,
          weekChange: 0,
          liquidationPrice:
            collateralLiquidationPrice.toDisplayStringWithSymbol(3),
          priceDistance: formatNumberAsPercent(
            getPriceDistance(collateralPrice, collateralLiquidationPrice)
          ),
        },
        {
          label: `${debt.symbol} / ${baseCurrency}`,
          currentPrice: collateralPrice.toDisplayStringWithSymbol(3),
          dayChange: 0,
          weekChange: 0,
          liquidationPrice: debtLiquidationPrice.toDisplayStringWithSymbol(3),
          priceDistance: formatNumberAsPercent(
            getPriceDistance(debtPrice, debtLiquidationPrice)
          ),
        },
      ];
    });

  const assetPriceRisk = liquidationPrices.filter(
    ({ riskExposure }) => !riskExposure?.isCrossCurrencyRisk
  );

  const hasLiquidationPrices = true;
  // const hasLiquidationPrices =
  //   exchangeRateRisk.length > 0 || assetPriceRisk.length > 0;

  if (!isAccountReady) return <PageLoading />;

  return (
    <Container>
      <RiskHeaderBox
        sx={{
          borderBottomLeftRadius: hasLiquidationPrices
            ? '0px'
            : theme.shape.borderRadius(),
          borderBottomRightRadius: hasLiquidationPrices
            ? '0px'
            : theme.shape.borderRadius(),
        }}
      >
        <H4 gutter={'default'}>
          <FormattedMessage defaultMessage={'Portfolio Health Factor'} />
        </H4>
        <Box sx={{ display: 'flex' }}>
          <Box sx={{ width: '50%' }}>
            <SliderRisk healthFactor={healthFactor} />
          </Box>
          <Box
            sx={{
              display: 'flex',
              width: '50%',
              justifyContent: 'space-evenly',
            }}
          >
            <LabelAndValue
              label={defineMessage({ defaultMessage: 'Total Collateral' })}
              value={profile
                .totalAssets()
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(3, true)}
            />
            <LabelAndValue
              label={defineMessage({ defaultMessage: 'Total Debt' })}
              value={profile
                .totalDebt()
                .abs()
                .toFiat(baseCurrency)
                .toDisplayStringWithSymbol(3, true)}
            />
            <LabelAndValue
              label={defineMessage({ defaultMessage: 'Loan to Value' })}
              value={loanToValue ? formatNumberAsPercent(loanToValue, 2) : '-'}
            />
          </Box>
        </Box>
      </RiskHeaderBox>
      {hasLiquidationPrices && (
        <Accordion
          disableGutters
          expanded={isExpanded}
          sx={{
            borderBottomLeftRadius: theme.shape.borderRadius(),
            borderBottomRightRadius: theme.shape.borderRadius(),
          }}
        >
          <LiquidationPriceExpander
            expandIcon={
              <ArrowIcon sx={{ color: theme.palette.primary.light }} />
            }
            sx={{
              borderBottom: isExpanded ? theme.shape.borderStandard : undefined,
              borderBottomLeftRadius: isExpanded
                ? undefined
                : theme.shape.borderRadius(),
              borderBottomRightRadius: isExpanded
                ? undefined
                : theme.shape.borderRadius(),
            }}
            onClick={() => setExpanded(!isExpanded)}
          >
            <LinkText
              msg={defineMessage({ defaultMessage: 'Liquidation Prices' })}
            />
          </LiquidationPriceExpander>
          <LiquidationPriceTables>TEST</LiquidationPriceTables>
        </Accordion>
      )}
    </Container>
  );
};
