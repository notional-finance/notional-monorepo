import { Box, styled, useTheme } from '@mui/material';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import {
  Body,
  ButtonText,
  InputLabel,
  LabelValue,
} from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';
import React from 'react';
import { formatLeverageRatio } from '@notional-finance/helpers';
import { useLeveragedNTokenPositions } from '../hooks';
import { BorrowTermsDropdown } from '../borrow-terms-dropdown/borrow-terms-dropdown';
import { LeverageSlider } from '../leverage-slider/leverage-slider';
import { useHistory } from 'react-router';

interface TermsProps {
  context: BaseTradeContext;
  CustomLeverageSlider?: typeof LeverageSlider;
  hideToggle?: boolean;
}

interface ManageTermsProps extends TermsProps {
  linkString: string;
  isVault?: boolean;
}

export const CustomTerms = ({ context, CustomLeverageSlider }: TermsProps) => {
  const theme = useTheme();
  const {
    state: { deposit },
  } = context;

  return (
    <Terms
      inputLabel={defineMessage({ defaultMessage: '2. Select Borrow Terms' })}
    >
      <BorrowTermsDropdown context={context} />
      <Box height={theme.spacing(6)} />
      {CustomLeverageSlider ? (
        <CustomLeverageSlider
          context={context}
          inputLabel={defineMessage({
            defaultMessage: '3. Specify leverage',
            description: 'input label',
          })}
        />
      ) : (
        <LeverageSlider
          showMinMax
          context={context}
          leverageCurrencyId={deposit?.currencyId}
          inputLabel={defineMessage({
            defaultMessage: '3. Specify leverage',
            description: 'input label',
          })}
        />
      )}
    </Terms>
  );
};

export const ManageTerms = ({
  context,
  linkString,
  isVault,
}: ManageTermsProps) => {
  const history = useHistory();
  const {
    state: { riskFactorLimit, deposit, debt, selectedNetwork },
  } = context;
  const { currentPosition } = useLeveragedNTokenPositions(
    selectedNetwork,
    deposit?.symbol
  );

  const leverageRatio =
    riskFactorLimit?.riskFactor === 'leverageRatio'
      ? (riskFactorLimit.limit as number)
      : 0;
  const borrowTypeVaults = debt?.symbol.includes('fixed')
    ? 'Fixed'
    : 'Variable';
  const borrowTypeLeveragedLiquidity =
    currentPosition?.debt?.tokenType === 'fCash' ? 'Fixed' : 'Variable';

  return (
    <Terms
      inputLabel={defineMessage({
        defaultMessage: 'Current Terms',
      })}
    >
      <TermsBox
        hasPosition={true}
        leverageRatio={leverageRatio}
        borrowType={isVault ? borrowTypeVaults : borrowTypeLeveragedLiquidity}
        actionClick={() => history.push(linkString)}
        actionBody={
          <Box sx={{ alignItems: 'center', display: 'flex' }}>
            <ButtonText accent>
              <FormattedMessage defaultMessage={'Manage Position'} />
            </ButtonText>
          </Box>
        }
      />
    </Terms>
  );
};

const Terms = ({
  inputLabel,
  children,
}: {
  inputLabel: MessageDescriptor;
  children: React.ReactNode | React.ReactNode[];
}) => {
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
