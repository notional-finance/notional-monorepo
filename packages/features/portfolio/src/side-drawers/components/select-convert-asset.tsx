import { useCallback, useEffect } from 'react';
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
  TradeContext,
  useAllMarkets,
  usePrimeCash,
  usePrimeDebt,
} from '@notional-finance/notionable-hooks';
import {
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { PORTFOLIO_ACTIONS, formatMaturity } from '@notional-finance/util';
import { TokenOption } from '@notional-finance/notionable';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { TransactionHeadings } from '@notional-finance/trade';
import { useConvertOptions } from '../hooks/use-convert-options';

interface SelectConvertAssetProps {
  context: TradeContext;
}

export const SelectConvertAsset = ({ context }: SelectConvertAssetProps) => {
  const theme = useTheme();
  const { state, updateState } = context;
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const {
    tradeType,
    debt,
    collateral,
    debtBalance,
    collateralBalance,
    selectedNetwork,
  } = state;
  const { nonLeveragedYields } = useAllMarkets(selectedNetwork);
  const { options, initialConvertFromBalance: balance } =
    useConvertOptions(state);
  let convertFromToken = tradeType === 'ConvertAsset' ? debt : collateral;
  const pCash = usePrimeCash(selectedNetwork, convertFromToken?.currencyId);
  const pDebt = usePrimeDebt(selectedNetwork, convertFromToken?.currencyId);
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

  const marketApy = nonLeveragedYields.find(
    (y) => y.token.id === convertFromToken?.id
  )?.totalAPY;
  const { selectedToken: selectedParamToken } = useParams<{
    selectedToken: string;
  }>();

  // Set the initial balance to the selected token
  useEffect(() => {
    if (
      selectedParamToken &&
      balance &&
      (convertFromToken === undefined || convertFromBalance === undefined)
    ) {
      updateState(
        tradeType === 'ConvertAsset'
          ? { debtBalance: balance, debt: balance.token }
          : { collateralBalance: balance, collateral: balance.token }
      );
    }
  }, [
    convertFromToken,
    convertFromBalance,
    selectedParamToken,
    balance,
    updateState,
    tradeType,
  ]);

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
      const onSelect = () => {
        if (tradeType === 'ConvertAsset') {
          navigate(`${pathname.replace('manage', 'convertTo')}/${o.token.id}`);
          updateState({ collateral: o.token });
        } else {
          navigate(`${pathname.replace('manage', 'convertTo')}/${o.token.id}`);
          updateState({ debt: o.token });
        }
      };
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
          onClick={onSelect}
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
    [updateState, tradeType, theme, navigate, pathname]
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
            value: `${formatNumberAsPercent(marketApy || 0)} APY`,
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
