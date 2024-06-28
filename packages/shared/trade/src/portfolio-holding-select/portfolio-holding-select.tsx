import { AssetSelectDropdown } from '@notional-finance/mui';
import { useCallback, useMemo } from 'react';
import { MessageDescriptor } from 'react-intl';
import {
  useUserSettings,
  BaseTradeContext,
  usePortfolioRiskProfile,
  usePrimeDebt,
  usePrimeCash,
} from '@notional-finance/notionable-hooks';
import { TokenBalance } from '@notional-finance/core-entities';
import { useHistory, useLocation, useParams } from 'react-router';
import { Box, useTheme } from '@mui/material';

interface PortfolioHoldingSelectProps {
  context: BaseTradeContext;
  inputLabel: MessageDescriptor;
  isWithdraw?: boolean;
  filterBalances: (
    b: TokenBalance,
    index: number,
    arr: TokenBalance[]
  ) => boolean;
  errorMsg?: MessageDescriptor;
  tightMarginTop?: boolean;
}

export const PortfolioHoldingSelect = ({
  context,
  inputLabel,
  tightMarginTop,
  filterBalances,
  isWithdraw,
}: PortfolioHoldingSelectProps) => {
  const { baseCurrency } = useUserSettings();
  const theme = useTheme();
  const {
    state: { collateral, debt, selectedNetwork, deposit },
  } = context;
  const profile = usePortfolioRiskProfile(selectedNetwork);
  const selectedToken = isWithdraw ? debt : collateral;
  const { pathname } = useLocation();
  const history = useHistory();
  const { selectedToken: _paramToken } = useParams<{
    selectedToken: string;
  }>();

  const primeDebt = usePrimeDebt(deposit?.network, deposit?.currencyId);
  const primeCash = usePrimeCash(deposit?.network, deposit?.currencyId);

  // NOTE: need to flip prime cash and prime debt for the select box
  const selectedTokenId =
    !isWithdraw && selectedToken?.tokenType === 'PrimeCash'
      ? primeDebt?.id
      : isWithdraw && selectedToken?.tokenType === 'PrimeDebt'
      ? primeCash?.id
      : selectedToken?.id;

  const options = useMemo(() => {
    return profile?.balances.filter(filterBalances)?.map((b) => {
      if (isWithdraw) {
        const maxWithdraw = profile.maxWithdraw(b.token);
        return {
          token: b.token,
          largeFigure: maxWithdraw?.toUnderlying().toFloat() || 0,
          largeFigureDecimals: 4,
          largeFigureSuffix: ' ' + b.underlying.symbol,
        };
      } else {
        // isRepay
        const underlying = b.toUnderlying();
        return {
          token: b.tokenType === 'PrimeCash' ? b.toPrimeDebt().token : b.token,
          largeFigure: underlying.toFloat() || 0,
          largeFigureDecimals: 4,
          largeFigureSuffix: ' ' + b.underlying.symbol,
          caption: underlying.toFiat(baseCurrency).toDisplayStringWithSymbol(),
        };
      }
    });
  }, [filterBalances, profile, isWithdraw, baseCurrency]);

  const onSelect = useCallback(
    (id: string | null) => {
      const newPath = `${pathname.split('/').slice(0, -1).join('/')}/${id}`;
      history.push(newPath);
    },
    [history, pathname]
  );

  return (
    <Box sx={{ marginBottom: theme.spacing(6) }}>
      <AssetSelectDropdown
        tightMarginTop={tightMarginTop}
        selectedTokenId={selectedTokenId}
        inputLabel={inputLabel}
        onSelect={onSelect}
        options={options}
      />
    </Box>
  );
};
