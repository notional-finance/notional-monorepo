import { useCallback, useContext, useEffect } from 'react';
import { Box, Divider, styled, useTheme } from '@mui/material';
import {
  LargeInputTextEmphasized,
  SideDrawerButton,
  ButtonText,
  H4,
  DataTable,
} from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor } from 'react-intl';
import { messages } from '../messages';
import {
  BaseContext,
  useAccountDefinition,
  useAllMarkets,
} from '@notional-finance/notionable-hooks';
import {
  formatMaturity,
  formatNumberAsPercent,
  formatTokenType,
} from '@notional-finance/helpers';
import { PORTFOLIO_ACTIONS } from '@notional-finance/shared-config';
import { TokenOption } from '@notional-finance/notionable';

interface SelectConvertAssetProps {
  context: BaseContext;
}

export const SelectConvertAsset = ({ context }: SelectConvertAssetProps) => {
  const theme = useTheme();
  const {
    state: {
      tradeType,
      debt,
      collateral,
      collateralOptions,
      debtOptions,
      debtBalance,
      collateralBalance,
    },
    updateState,
  } = useContext(context);
  const { account } = useAccountDefinition();
  const { allYields } = useAllMarkets();
  const options =
    tradeType === 'ConvertAsset' ? collateralOptions : debtOptions;
  const convertFromToken = tradeType === 'ConvertAsset' ? debt : collateral;
  const convertFromBalance =
    tradeType === 'ConvertAsset' ? debtBalance : collateralBalance;
  const marketApy = allYields.find(
    (y) => y.leveraged === undefined && y.token.id === convertFromToken?.id
  )?.totalAPY;

  // Set the initial balance to the selected token
  useEffect(() => {
    if (
      convertFromToken &&
      (!convertFromBalance ||
        convertFromBalance.tokenId !== convertFromToken.id)
    ) {
      const balance = account?.balances.find(
        (t) => t.tokenId === convertFromToken.id
      );
      updateState(
        tradeType === 'ConvertAsset'
          ? { debtBalance: balance }
          : { collateralBalance: balance }
      );
    }
  }, [convertFromToken, convertFromBalance, account, updateState, tradeType]);

  let heading: MessageDescriptor;
  let fixedHeading: MessageDescriptor;
  let variableHeading: MessageDescriptor;
  if (tradeType === 'ConvertAsset') {
    heading = messages[PORTFOLIO_ACTIONS.CONVERT_ASSET]['heading'];
    fixedHeading = messages[PORTFOLIO_ACTIONS.CONVERT_ASSET]['fixedHeading'];
    variableHeading =
      messages[PORTFOLIO_ACTIONS.CONVERT_ASSET]['variableHeading'];
  } else {
    heading = messages[PORTFOLIO_ACTIONS.REPAY_DEBT]['heading'];
    fixedHeading = messages[PORTFOLIO_ACTIONS.REPAY_DEBT]['fixedHeading'];
    variableHeading = messages[PORTFOLIO_ACTIONS.REPAY_DEBT]['variableHeading'];
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
          }}
        >
          <ButtonText sx={{ flex: 1 }}>{text}</ButtonText>
          <ButtonData>{`${formatNumberAsPercent(o?.interestRate || 0)} ${
            o.token.tokenType === 'fCash' ? 'Fixed APY' : 'APY'
          }`}</ButtonData>
        </SideDrawerButton>
      );
    },
    [updateState, tradeType]
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
        tableTitle={
          <span>{title ? `${title.title} ${title.caption || ''}` : ''}</span>
        }
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
            value: convertFromBalance?.toDisplayStringWithSymbol(3, true),
          },
          {
            detail: <FormattedMessage defaultMessage={'Present Value'} />,
            value: convertFromBalance
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
        <Box>
          <H4 msg={fixedHeading} />
          {fixedOptions}
          <Divider />
        </Box>
      ) : null}
      {variableOptions.length > 0 ? (
        <Box>
          <H4 msg={variableHeading} />
          {variableOptions}
        </Box>
      ) : null}
    </Box>
  );
};

const ButtonData = styled(ButtonText)(
  ({ theme }) => `
    float: right;
    border: ${theme.shape.borderStandard};
    border-color: ${theme.palette.primary.light};
    background: ${theme.palette.background.paper};
    padding: ${theme.spacing(1, 2)};
    border-radius: ${theme.shape.borderRadius()};
    color: ${theme.palette.common.black};
    margin-bottom: 0px;
  `
);
