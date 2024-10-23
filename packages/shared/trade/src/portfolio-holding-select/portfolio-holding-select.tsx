import { AssetSelectDropdown } from '@notional-finance/mui';
import { useCallback } from 'react';
import { MessageDescriptor } from 'react-intl';
import {
  BaseTradeContext,
  usePrimeDebt,
  usePrimeCash,
  useCurrentNetworkAccount,
} from '@notional-finance/notionable-hooks';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { Box, useTheme } from '@mui/material';
import { useAppStore } from '@notional-finance/notionable';

interface PortfolioHoldingSelectProps {
  context: BaseTradeContext;
  inputLabel: MessageDescriptor;
  isWithdraw?: boolean;
  errorMsg?: MessageDescriptor;
  tightMarginTop?: boolean;
}

export const PortfolioHoldingSelect = ({
  context,
  inputLabel,
  tightMarginTop,
  isWithdraw,
}: PortfolioHoldingSelectProps) => {
  const { baseCurrency } = useAppStore();
  const theme = useTheme();
  const {
    state: { collateral, debt, deposit },
  } = context;
  const selectedToken = isWithdraw ? debt : collateral;
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { selectedToken: _paramToken } = useParams<{
    selectedToken: string;
  }>();
  const account = useCurrentNetworkAccount();
  const options = isWithdraw
    ? account?.getWithdrawAmounts()
    : account?.getRepayAmounts(baseCurrency);

  const primeDebt = usePrimeDebt(deposit?.currencyId);
  const primeCash = usePrimeCash(deposit?.currencyId);

  // NOTE: need to flip prime cash and prime debt for the select box
  const selectedTokenId =
    !isWithdraw && selectedToken?.tokenType === 'PrimeCash'
      ? primeDebt?.id
      : isWithdraw && selectedToken?.tokenType === 'PrimeDebt'
      ? primeCash?.id
      : selectedToken?.id;

  const onSelect = useCallback(
    (id: string | null) => {
      const newPath = `${pathname.split('/').slice(0, -1).join('/')}/${id}`;
      navigate(newPath);
    },
    [navigate, pathname]
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
