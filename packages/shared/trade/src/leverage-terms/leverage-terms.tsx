import { Box, styled, useTheme } from '@mui/material';
import { BaseTradeContext } from '@notional-finance/notionable-hooks';
import {
  Body,
  ButtonText,
  InputLabel,
  LabelValue,
  ToggleSwitch,
} from '@notional-finance/mui';
import { FormattedMessage, MessageDescriptor, defineMessage } from 'react-intl';
import React from 'react';
import {
  formatLeverageRatio,
  formatNumberAsPercent,
} from '@notional-finance/helpers';
import { BorrowTermsDropdown } from '../borrow-terms-dropdown/borrow-terms-dropdown';
import { LeverageSlider } from '../leverage-slider/leverage-slider';
import { useMaxYield } from '../hooks';
import { useHistory } from 'react-router';
import { PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';

interface TermsProps {
  context: BaseTradeContext;
  CustomLeverageSlider?: typeof LeverageSlider;
}

interface ManageTermsProps extends TermsProps {
  linkString: string;
}

export const CustomTerms = ({ context, CustomLeverageSlider }: TermsProps) => {
  const theme = useTheme();
  const {
    state: { deposit },
  } = context;

  return (
    <Terms
      inputLabel={defineMessage({ defaultMessage: '2. Select Borrow Terms' })}
      hasPosition={false}
      context={context}
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

export const DefaultTerms = ({ context }: TermsProps) => {
  const {
    state: { customizeLeverage, riskFactorLimit, deposit, selectedNetwork },
    updateState,
  } = context;

  const toggleLeverage = () =>
    updateState({ customizeLeverage: !customizeLeverage });
  const maxYield = useMaxYield(selectedNetwork).find(
    (y) => y.token.currencyId === deposit?.currencyId
  )?.totalAPY;

  const leverageRatio =
    riskFactorLimit?.riskFactor === 'leverageRatio'
      ? (riskFactorLimit.limit as number)
      : 0;

  return (
    <Terms
      inputLabel={defineMessage({
        defaultMessage: 'Default Terms are Selected',
      })}
      hasPosition={false}
      context={context}
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
                  max: maxYield ? formatNumberAsPercent(maxYield) : '',
                }}
              />
            </Body>
          </Box>
        }
      />
    </Terms>
  );
};

export const ManageTerms = ({ context, linkString }: ManageTermsProps) => {
  const history = useHistory();
  const {
    state: { riskFactorLimit, debt },
  } = context;

  const borrowType =
    debt?.maturity === undefined || debt?.maturity === PRIME_CASH_VAULT_MATURITY
      ? 'Variable'
      : 'Fixed';

  const leverageRatio =
    riskFactorLimit?.riskFactor === 'leverageRatio'
      ? (riskFactorLimit.limit as number)
      : 0;

  return (
    <Terms
      inputLabel={defineMessage({
        defaultMessage: 'Current Terms',
      })}
      hasPosition={true}
      context={context}
    >
      <TermsBox
        hasPosition={true}
        leverageRatio={leverageRatio}
        borrowType={borrowType}
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
  hasPosition,
  children,
  context,
}: {
  inputLabel: MessageDescriptor;
  hasPosition: boolean;
  children: React.ReactNode | React.ReactNode[];
  context: BaseTradeContext;
}) => {
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
