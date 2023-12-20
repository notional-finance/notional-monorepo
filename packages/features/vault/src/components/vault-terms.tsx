import { Box, styled, useTheme } from '@mui/material';
// import { VaultActionContext } from '../../liquidity';
import { BorrowTermsDropdown } from '@notional-finance/trade';
import { VaultActionContext } from '../vault';
import {
  Body,
  ButtonText,
  InputLabel,
  LabelValue,
  ToggleSwitch,
} from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';
import React, { useContext } from 'react';
import { LeverageSlider } from '@notional-finance/trade';
import {
  formatLeverageRatio,
  //   formatNumberAsPercent,
} from '@notional-finance/helpers';
// import { useMaxYield } from '../hooks/use-max-yield';
import { useHistory } from 'react-router';
// import { useLeveragedNTokenPositions } from '../hooks';
import { PRODUCTS } from '@notional-finance/util';

export const CustomLiquidityTerms = () => {
  const theme = useTheme();
  const context = useContext(VaultActionContext);
  const {
    state: { deposit },
  } = context;

  return (
    <LiquidityTerms
      inputLabel={defineMessage({ defaultMessage: '2. Select Borrow Terms' })}
      hasPosition={false}
    >
      <BorrowTermsDropdown context={context} />
      <Box height={theme.spacing(6)} />
      <LeverageSlider
        showMinMax
        context={context}
        leverageCurrencyId={deposit?.currencyId}
        inputLabel={defineMessage({
          defaultMessage: '3. Specify leverage',
          description: 'input label',
        })}
      />
    </LiquidityTerms>
  );
};

export const DefaultLiquidityTerms = () => {
  const {
    state: { customizeLeverage, riskFactorLimit }, // deposit
    updateState,
  } = useContext(VaultActionContext);

  const toggleLeverage = () =>
    updateState({ customizeLeverage: !customizeLeverage });
  //   const maxYield = useMaxYield().find(
  //     (y) => y.token.currencyId === deposit?.currencyId
  //   )?.totalAPY;
  const leverageRatio =
    riskFactorLimit?.riskFactor === 'leverageRatio'
      ? (riskFactorLimit.limit as number)
      : 0;

  return (
    <LiquidityTerms
      inputLabel={defineMessage({
        defaultMessage: 'Default Terms are Selected',
      })}
      hasPosition={false}
    >
      <TermsBox
        hasPosition={false}
        leverageRatio={leverageRatio}
        borrowType="Variable"
        actionClick={toggleLeverage}
        actionBody={
          <Box>
            <Body
              gutter="default"
              main
              msg={defineMessage({ defaultMessage: 'Customize' })}
            />
            <Body>
              <FormattedMessage
                defaultMessage={'Up to {max} APY'}
                values={{
                  //   max: maxYield ? formatNumberAsPercent(maxYield) : '',
                  max: '',
                }}
              />
            </Body>
          </Box>
        }
      />
    </LiquidityTerms>
  );
};

export const ManageLiquidityTerms = () => {
  const history = useHistory();
  const {
    state: { riskFactorLimit, deposit },
  } = useContext(VaultActionContext);
  //   const { currentPosition } = useLeveragedNTokenPositions(deposit?.symbol);

  const leverageRatio =
    riskFactorLimit?.riskFactor === 'leverageRatio'
      ? (riskFactorLimit.limit as number)
      : 0;

  return (
    <LiquidityTerms
      inputLabel={defineMessage({
        defaultMessage: 'Current Terms',
      })}
      hasPosition={true}
    >
      <TermsBox
        hasPosition={true}
        leverageRatio={leverageRatio}
        borrowType={
          //   currentPosition?.debt.tokenType === 'fCash' ? 'Fixed' : 'Variable'
          'Variable'
        }
        actionClick={() =>
          history.push(
            `/${PRODUCTS.LIQUIDITY_LEVERAGED}/Manage/${deposit?.symbol}`
          )
        }
        actionBody={
          <Box sx={{ alignItems: 'center', display: 'flex' }}>
            <ButtonText accent>
              <FormattedMessage defaultMessage={'Manage Position'} />
            </ButtonText>
          </Box>
        }
      />
    </LiquidityTerms>
  );
};

const LiquidityTerms = ({
  inputLabel,
  hasPosition,
  children,
}: {
  inputLabel: MessageDescriptor;
  hasPosition: boolean;
  children: React.ReactNode | React.ReactNode[];
}) => {
  const context = useContext(VaultActionContext);
  const { state, updateState } = context;
  const { customizeLeverage } = state;

  const toggleLeverage = () =>
    updateState({ customizeLeverage: !customizeLeverage });

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
        }}
      >
        <InputLabel inputLabel={inputLabel} />
        {!hasPosition && (
          <ToggleSwitch
            isChecked={customizeLeverage}
            onToggle={toggleLeverage}
            label={<FormattedMessage defaultMessage={'Customize'} />}
          />
        )}
      </Box>
      <Box>{children}</Box>
    </Box>
  );
};

const TermsBox = ({
  leverageRatio,
  hasPosition,
  borrowType,
  actionClick,
  actionBody,
}: {
  leverageRatio: number;
  hasPosition: boolean;
  borrowType: 'Fixed' | 'Variable';
  actionBody: React.ReactNode;
  actionClick: () => void;
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        justifyContent: 'space-between',
      }}
    >
      <BoundedBox
        sx={{
          flexGrow: 1,
          marginRight: theme.spacing(3),
          background: hasPosition ? undefined : theme.palette.info.light,
          border: hasPosition
            ? theme.shape.borderStandard
            : `1px solid ${theme.palette.primary.light}`,
        }}
      >
        <Box sx={{ marginRight: theme.spacing(3) }}>
          <Body
            uppercase
            gutter="default"
            msg={defineMessage({ defaultMessage: 'Leverage' })}
          />
          <LabelValue>{formatLeverageRatio(leverageRatio, 2)}</LabelValue>
        </Box>
        <Box sx={{ marginRight: theme.spacing(3) }}>
          <Body
            uppercase
            gutter="default"
            msg={defineMessage({ defaultMessage: 'Borrow' })}
          />
          <LabelValue>
            {borrowType === 'Variable' ? (
              <FormattedMessage defaultMessage={'Variable'} />
            ) : (
              <FormattedMessage defaultMessage={'Fixed'} />
            )}
          </LabelValue>
        </Box>
        <Box>
          <Body
            uppercase
            gutter="default"
            msg={defineMessage({ defaultMessage: 'Risk' })}
          />
          <LabelValue>
            <FormattedMessage defaultMessage={'Low'} />
          </LabelValue>
        </Box>
      </BoundedBox>
      <BoundedBox
        sx={{
          border: hasPosition
            ? `1px solid ${theme.palette.primary.light}`
            : theme.shape.borderStandard,
          ':hover': {
            background: theme.palette.info.light,
            cursor: 'pointer',
          },
        }}
        aria-controls="button"
        onClick={actionClick}
      >
        {actionBody}
      </BoundedBox>
    </Box>
  );
};

const BoundedBox = styled(Box)(
  ({ theme }) => `
display: flex;
border-radius: ${theme.shape.borderRadius()};
border: ${theme.shape.borderStandard};
padding: ${theme.spacing(2)};
justify-content: space-evenly;
`
);
