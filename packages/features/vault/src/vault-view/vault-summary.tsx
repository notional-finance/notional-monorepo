import { Box, SxProps, useTheme } from '@mui/material';
import {
  Faq,
  FaqHeader,
  DataTable,
  TotalRow,
  InfoTooltip,
} from '@notional-finance/mui';
import { useContext } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';
import { MobileVaultSummary, VaultModal } from '../components';
import { VaultActionContext } from '../vault';
import {
  LiquidationChart,
  PerformanceChart,
  TradeActionSummary,
} from '@notional-finance/trade';
import {
  useVaultReinvestmentTable,
  useVaultExistingFactors,
  useVaultFaq,
} from '../hooks';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import {
  useAllMarkets,
  useAllVaults,
  useSelectedNetwork,
} from '@notional-finance/notionable-hooks';
import { useAppStore } from '@notional-finance/notionable';

const ToolTip = ({ title, sx }: { title?: string; sx: SxProps }) => {
  const selectedNetwork = useSelectedNetwork();
  const listedVaults = useAllVaults(selectedNetwork);
  const { state } = useContext(VaultActionContext);
  const { maxPoolShare, vaultAddress } = state;
  const theme = useTheme();
  const vaultData = listedVaults.find(
    (vault) => vault.vaultAddress === vaultAddress
  );

  const toopTipData = {
    borrowCapacity: defineMessage({
      defaultMessage:
        'Remaining amount that can be borrowed by this vault before max capacity.',
    }),
    poolCapWithMaxShare: defineMessage({
      defaultMessage:
        'This vault can only hold {maxPoolShare} of total LP tokens in the {boosterProtocol} / {baseProtocol} pool. Remaining pool capacity can change as liquidity in the {boosterProtocol} / {baseProtocol} pool increases or decreases.',
      values: {
        maxPoolShare: maxPoolShare,
        baseProtocol: vaultData?.baseProtocol,
        boosterProtocol: vaultData?.boosterProtocol,
      },
    }),
    poolCapWithMaxShareSameProtocol: defineMessage({
      defaultMessage:
        'This vault can only hold {maxPoolShare} of total LP tokens in the {boosterProtocol} pool. Remaining pool capacity can change as liquidity in the {boosterProtocol} pool increases or decreases.',
      values: {
        maxPoolShare: maxPoolShare,
        boosterProtocol: vaultData?.boosterProtocol,
      },
    }),
  };

  const currentTip = title?.includes('Borrow Capacity')
    ? toopTipData.borrowCapacity
    : vaultData?.baseProtocol === vaultData?.boosterProtocol
    ? toopTipData.poolCapWithMaxShareSameProtocol
    : toopTipData.poolCapWithMaxShare;

  return (
    <InfoTooltip
      sx={{ ...sx }}
      iconSize={theme.spacing(2)}
      iconColor={theme.palette.typography.accent}
      toolTipText={currentTip}
    />
  );
};

export const VaultSummary = () => {
  const theme = useTheme();
  const { state } = useContext(VaultActionContext);
  const { baseCurrency } = useAppStore();
  const {
    vaultAddress,
    totalCapacityRemaining,
    totalPoolCapacityRemaining,
    selectedNetwork,
    collateral,
    deposit,
    vaultTVL,
  } = state;
  const { vaultShare, assetLiquidationPrice, priorBorrowRate, leverageRatio } =
    useVaultExistingFactors();
  const { nonLeveragedYields } = useAllMarkets(selectedNetwork);

  const nonLeveragedYield = nonLeveragedYields.find(
    (y) => y.token.id === collateral?.id
  );
  const points = nonLeveragedYield?.pointMultiples;

  const { faqHeaderLinks, faqs } = useVaultFaq(
    selectedNetwork,
    deposit?.symbol,
    points
  );

  const tvl = vaultTVL?.toFiat(baseCurrency);

  const totalsData = [
    {
      title: 'TVL',
      value: tvl?.toFloat(),
      prefix: tvl?.fiatSymbol,
      decimals: 2,
    },
    {
      title: 'Remaining Borrow Capacity',
      Icon: ToolTip,
      value: totalCapacityRemaining?.isNegative()
        ? 0
        : totalCapacityRemaining?.toFloat(),
      suffix: ` ${totalCapacityRemaining?.symbol || ''}`,
      decimals: 0,
    },
    {
      title: 'Remaining Pool Capacity',
      Icon: ToolTip,
      value: totalPoolCapacityRemaining?.isNegative()
        ? 0
        : totalPoolCapacityRemaining?.toFloat(),
      suffix: ` ${totalPoolCapacityRemaining?.symbol || ''}`,
      decimals: 0,
    },
  ];

  const { reinvestmentTableData, reinvestmentTableColumns } =
    useVaultReinvestmentTable(selectedNetwork, deposit, vaultAddress);

  return (
    <Box>
      {points && <VaultModal />}
      <Box
        sx={{
          zIndex: 10,
          position: 'fixed',
          maxWidth: '100vw',
          display: {
            xs: 'block',
            sm: 'block',
            md: 'none',
          },
        }}
      >
        <MobileVaultSummary />
      </Box>
      <Box
        sx={{
          display: {
            xs: 'none',
            sm: 'none',
            md: 'block',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <TradeActionSummary
            state={state}
            priorVaultFactors={{
              vaultShare,
              vaultBorrowRate: priorBorrowRate,
              leverageRatio,
            }}
          >
            <PerformanceChart
              state={state}
              priorVaultFactors={{
                vaultShare,
                vaultBorrowRate: priorBorrowRate,
                leverageRatio,
                isPrimeBorrow:
                  vaultShare?.maturity === PRIME_CASH_VAULT_MATURITY,
              }}
            />
            <TotalRow totalsData={totalsData} />
            <LiquidationChart
              state={state}
              vaultCollateral={vaultShare}
              vaultLiquidationPrice={assetLiquidationPrice}
            />
            <Box
              sx={{
                marginBottom: theme.spacing(5),
                marginTop: theme.spacing(5),
              }}
            >
              <DataTable
                tableTitle={
                  <FormattedMessage
                    defaultMessage={'Vault Reinvestment History'}
                  />
                }
                data={reinvestmentTableData}
                maxHeight={theme.spacing(51)}
                columns={reinvestmentTableColumns}
              />
            </Box>
            <FaqHeader
              title={
                <FormattedMessage defaultMessage={'Leveraged Vault FAQ'} />
              }
              links={faqHeaderLinks}
            />
            {faqs.map(
              (
                { question, answer, componentAnswer, questionDescription },
                index
              ) => (
                <Faq
                  key={index}
                  question={question}
                  answer={answer}
                  componentAnswer={componentAnswer}
                  questionDescription={questionDescription}
                  sx={{
                    marginBottom: theme.spacing(2),
                    boxShadow: theme.shape.shadowStandard,
                  }}
                />
              )
            )}
          </TradeActionSummary>
        </Box>
      </Box>
    </Box>
  );
};

export default VaultSummary;
