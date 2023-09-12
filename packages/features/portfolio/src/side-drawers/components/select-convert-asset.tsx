import { useCallback, useEffect } from 'react';
import { Box, useTheme } from '@mui/material';
import {
  LargeInputTextEmphasized,
  SideDrawerButton,
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
} from '@notional-finance/notionable-hooks';
import {
  formatMaturity,
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { PORTFOLIO_ACTIONS } from '@notional-finance/util';
import { TokenOption } from '@notional-finance/notionable';
import { useParams } from 'react-router';
import { TransactionHeadings } from '@notional-finance/trade';
import { useConvertOptions } from '../hooks/use-convert-options';

interface SelectConvertAssetProps {
  context: TradeContext;
}

export const SelectConvertAsset = ({ context }: SelectConvertAssetProps) => {
  const theme = useTheme();
  const { state, updateState } = context;
  const { tradeType, debt, collateral, debtBalance, collateralBalance } = state;
  const { nonLeveragedYields } = useAllMarkets();
  const { options, initialConvertFromBalance: balance } =
    useConvertOptions(state);
  const convertFromToken = tradeType === 'ConvertAsset' ? debt : collateral;
  const convertFromBalance =
    tradeType === 'ConvertAsset' ? debtBalance : collateralBalance;
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
          ? { debtBalance: balance, debt: balance?.token }
          : { collateralBalance: balance, collateral: balance?.token }
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
          updateState({ collateral: o.token });
        } else {
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
          <ButtonText sx={{ flex: 1 }}>{text}</ButtonText>
          <ButtonData>{`${formatNumberAsPercent(o?.interestRate || 0)} ${
            o.token.tokenType === 'fCash' ? 'Fixed APY' : 'APY'
          }`}</ButtonData>
        </SideDrawerButton>
      );
    },
    [updateState, tradeType, theme]
  );

  const fixedOptions =
    options
      ?.filter((t) => t.token.tokenType === 'fCash' && !!t.balance)
      .map(createTokenOption) || [];

  const variableOptions =
    options
      ?.filter((t) => t.token.tokenType !== 'fCash' && !!t.balance)
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
            Header: <FormattedMessage defaultMessage="Detail" />,
            accessor: 'detail',
            textAlign: 'left',
          },
          {
            Header: <FormattedMessage defaultMessage="Current" />,
            accessor: 'value',
            textAlign: 'right',
          },
        ]}
        data={[
          {
            detail: <FormattedMessage defaultMessage={'Amount'} />,
            value: `${(tradeType === 'ConvertAsset'
              ? convertFromBalance?.abs()
              : convertFromBalance
            )?.toDisplayString(3, true)} ${title?.title || ''}`,
          },
          {
            detail: <FormattedMessage defaultMessage={'Present Value'} />,
            value: (tradeType === 'ConvertAsset'
              ? convertFromBalance?.abs()
              : convertFromBalance
            )
              ?.toUnderlying()
              .toDisplayStringWithSymbol(3, true),
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
