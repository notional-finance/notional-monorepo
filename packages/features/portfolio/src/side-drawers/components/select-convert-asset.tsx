import { useCallback } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  LargeInputTextEmphasized,
  SideDrawerButton,
  DisplayCell,
  ButtonText,
  DataTable,
  Body,
  TABLE_VARIANTS,
  ButtonData,
} from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { messages } from '../messages';
import {
  usePrimeCash,
  usePrimeDebt,
  useCurrentTradeContext,
  usePortfolioHoldings,
} from '@notional-finance/notionable-hooks';
import {
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { PORTFOLIO_ACTIONS, formatMaturity } from '@notional-finance/util';
import { TokenOption } from '@notional-finance/notionable';
import { useParams, useLocation } from 'react-router-dom';
import { TransactionHeadings } from '@notional-finance/trade';

export const SelectConvertAsset = () => {
  const theme = useTheme();
  const trade = useCurrentTradeContext();
  const holdings = usePortfolioHoldings(trade?.selectedNetwork);
  const { selectedToken: selectedParamToken } = useParams<{
    selectedToken: string;
  }>();
  const holding = holdings?.find(
    (h) => h.balance.tokenId === selectedParamToken
  );

  const { debt, collateral } = trade?.selectedTokens ?? {};
  const debtBalance = trade?.debtBalance;
  const collateralBalance = trade?.collateralBalance;
  const tradeType = trade?.tradeType;

  const { debt: debtOptions, collateral: collateralOptions } =
    trade?.computedOptions ?? {};

  const { pathname } = useLocation();
  let convertFromToken = tradeType === 'ConvertAsset' ? debt : collateral;
  const pCash = usePrimeCash(convertFromToken?.currencyId);
  const pDebt = usePrimeDebt(convertFromToken?.currencyId);
  if (convertFromToken?.tokenType === 'PrimeCash') {
    convertFromToken = pDebt;
  } else if (convertFromToken?.tokenType === 'PrimeDebt') {
    convertFromToken = pCash;
  }

  const convertFromBalance =
    convertFromToken &&
    (tradeType === 'ConvertAsset' ? debtBalance : collateralBalance)?.toToken(
      convertFromToken
    );

  const options = (
    tradeType === 'ConvertAsset' ? collateralOptions : debtOptions
  )?.filter((o) => o.token.id !== convertFromToken?.id);

  let heading: MessageDescriptor;
  let fixedHeading: MessageDescriptor;
  let variableHeading: MessageDescriptor;
  if (tradeType === 'ConvertAsset') {
    heading = TransactionHeadings[tradeType].heading;
    fixedHeading = messages[PORTFOLIO_ACTIONS.CONVERT_ASSET]['fixedHeading'];
    variableHeading =
      messages[PORTFOLIO_ACTIONS.CONVERT_ASSET]['variableHeading'];
  } else {
    heading = TransactionHeadings['RollDebt'].heading;
    fixedHeading = messages[PORTFOLIO_ACTIONS.ROLL_DEBT]['fixedHeading'];
    variableHeading = messages[PORTFOLIO_ACTIONS.ROLL_DEBT]['variableHeading'];
  }

  const createTokenOption = useCallback(
    (o: TokenOption) => {
      let text: string;
      if (o.token.tokenType === 'fCash') {
        text = formatMaturity(o.token.maturity || 0);
      } else {
        text =
          o.token.tokenType === 'PrimeDebt'
            ? 'Variable Borrow'
            : o.token.tokenType === 'PrimeCash'
            ? 'Variable Lend'
            : 'Provide Liquidity';
      }

      return (
        <SideDrawerButton
          key={o.token.id}
          to={`${pathname.replace('manage', 'convertTo')}/${o.token.id}`}
          sx={{
            cursor: 'pointer',
            height: theme.spacing(8),
          }}
        >
          <ButtonText sx={{ display: 'flex', flex: 1 }}>{text}</ButtonText>
          {o.interestRate !== undefined && (
            <ButtonData>{`${formatNumberAsPercent(o.interestRate)} ${
              o.token.tokenType === 'fCash' ? 'Fixed APY' : 'APY'
            }`}</ButtonData>
          )}
        </SideDrawerButton>
      );
    },
    [theme, pathname]
  );

  const fixedOptions =
    options
      ?.filter((t) => t.token.tokenType === 'fCash')
      .map(createTokenOption) || [];

  const variableOptions =
    options
      ?.filter((t) => t.token.tokenType !== 'fCash')
      .map(createTokenOption) || [];

  const title = convertFromToken
    ? formatTokenType(convertFromToken)
    : undefined;

  return (
    <Box>
      <LargeInputTextEmphasized
        gutter="default"
        sx={{ marginBottom: theme.spacing(5) }}
      >
        <FormattedMessage {...heading} />
      </LargeInputTextEmphasized>
      <DataTable
        tableVariant={TABLE_VARIANTS.MINI}
        tableTitle={<span>{title?.titleWithMaturity || ''}</span>}
        columns={[
          {
            header: <FormattedMessage defaultMessage="Detail" />,
            accessorKey: 'detail',
            cell: DisplayCell,
            textAlign: 'left',
          },
          {
            header: <FormattedMessage defaultMessage="Current" />,
            accessorKey: 'value',
            textAlign: 'right',
          },
        ]}
        data={[
          {
            detail: <FormattedMessage defaultMessage={'Amount'} />,
            value: `${(tradeType === 'ConvertAsset'
              ? convertFromBalance?.abs()
              : convertFromBalance
            )?.toDisplayString(2, true)} ${title?.title || ''}`,
          },
          {
            detail: <FormattedMessage defaultMessage={'Present Value'} />,
            value: (tradeType === 'ConvertAsset'
              ? convertFromBalance?.abs()
              : convertFromBalance
            )
              ?.toUnderlying()
              .toDisplayStringWithSymbol(2, true),
          },
          {
            detail: <FormattedMessage defaultMessage={'Market APY'} />,
            value: `${formatNumberAsPercent(
              holding?.marketYield?.totalAPY || 0
            )} APY`,
          },
        ]}
      />
      {fixedOptions.length > 0 ? (
        <Box sx={{ marginTop: theme.spacing(6) }}>
          <Body
            msg={fixedHeading}
            gutter={'default'}
            uppercase
            fontWeight="bold"
          />
          {fixedOptions}
        </Box>
      ) : null}
      {variableOptions.length > 0 ? (
        <Box sx={{ marginTop: theme.spacing(6) }}>
          <Body
            msg={variableHeading}
            gutter={'default'}
            uppercase
            fontWeight="bold"
          />
          {variableOptions}
        </Box>
      ) : null}
    </Box>
  );
};
