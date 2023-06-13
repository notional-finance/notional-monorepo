import { styled, Box, Button, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import OptionUnstyled from '@mui/base/OptionUnstyled';
import {
  Caption,
  CountUp,
  H4,
  InputLabel,
  Paragraph,
  SelectDropdown,
  useCurrencyInputRef,
} from '@notional-finance/mui';
import { CollateralAction } from '@notional-finance/sdk';
import { formatNumber, formatNumberAsPercent } from '@notional-finance/helpers';
import { useEffect, useState, useRef } from 'react';
import { defineMessage, FormattedMessage, MessageDescriptor } from 'react-intl';
import { useCollateralSelect } from './use-collateral-select';
import { WalletDepositInput } from '../wallet-deposit-input/wallet-deposit-input';

interface CollateralSelectProps {
  availableTokens: string[];
  selectedToken: string;
  inputLabel: MessageDescriptor;
  onChange: (
    selectedToken: string | null,
    collateralAction: CollateralAction | undefined,
    hasError: boolean,
    collateralApy: number | undefined,
    collateralSymbol: string | undefined
  ) => void;
  selectedBorrowMarketKey?: string | null;
  errorMsg?: MessageDescriptor;
  tightMarginTop?: boolean;
}

const StyledButton = styled(Button)(
  ({ theme }) => `
    color: unset;
    text-transform: unset;
    width: 100%;
    padding-right: ${theme.spacing(2)};
    padding-left: ${theme.spacing(2)};
    border-radius: ${theme.shape.borderRadius()};
    border: ${theme.shape.borderStandard};
    .symbol {
      margin-right: auto;
    }
    .MuiButton-endIcon {
      margin-right: 0px;
    }
  `
);

const CollateralInfo = styled(Box)`
  text-align: right;
`;

const StyledSymbol = styled(Box)`
  display: flex;
  align-items: center;
`;

const StyledMenuItem = styled(OptionUnstyled)(
  ({ theme }) => `
  font-family: ${theme.typography.fontFamily};
  padding: ${theme.spacing(1, 2)};
  display: flex;
  justify-content: space-between;
  line-height: 1.4;
  align-items: center;

  &:hover {
    background-color: ${theme.palette.background.default};
    cursor: pointer;
  }
`
);

export const CollateralSelect = ({
  availableTokens,
  selectedToken,
  selectedBorrowMarketKey,
  inputLabel,
  errorMsg,
  onChange,
  tightMarginTop,
}: CollateralSelectProps) => {
  const theme = useTheme();
  const [hasFocus, setHasFocus] = useState(false);
  const dropDownRef = useRef(null);
  const {
    selectedOptionKey,
    collateralAction,
    hasError,
    collateralOptions,
    highestApyString,
    warningMsg,
    updateCollateralSelectState,
  } = useCollateralSelect(selectedToken, selectedBorrowMarketKey);
  const { currencyInputRef } = useCurrencyInputRef();
  const selectedOption = collateralOptions.find(
    ({ symbol }) => symbol === selectedOptionKey
  );
  const selectedApy = selectedOption?.apy;
  const selectedSymbol = selectedOption?.symbol;

  useEffect(() => {
    // NOTE: do not trigger this on selectedToken change or we will get an infinite loop
    onChange(
      selectedToken,
      collateralAction,
      hasError,
      selectedApy,
      selectedSymbol
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collateralAction, hasError, selectedApy, selectedSymbol]);

  return (
    // Tight margin top is used to make the spacing look cleaner on the borrow side drawer
    <Box marginTop={tightMarginTop ? theme.spacing(-3) : undefined}>
      <WalletDepositInput
        ref={currencyInputRef}
        inputRef={currencyInputRef}
        availableTokens={availableTokens}
        selectedToken={selectedToken}
        errorMsgOverride={errorMsg}
        warningMsg={warningMsg}
        onChange={({
          selectedToken: newSelectedToken,
          inputAmount: _inputAmount,
          hasError,
        }) => {
          throw Error('Unimplemented');
          if (selectedToken !== newSelectedToken)
            onChange(newSelectedToken, undefined, false, undefined, undefined);
          updateCollateralSelectState({ inputAmount: undefined, hasError });
        }}
        inputLabel={inputLabel}
      />
      {selectedOptionKey && collateralOptions.length > 0 && (
        <div>
          <InputLabel
            inputLabel={defineMessage({
              defaultMessage:
                'Your collateral will automatically be converted into:',
              description: 'input label',
            })}
          />
          <SelectDropdown
            popperRef={dropDownRef}
            buttonComponent={StyledButton}
            value={selectedOptionKey}
            landingPage={false}
            onChange={(selectedCollateral: string | null) => {
              if (selectedCollateral)
                updateCollateralSelectState({ selectedCollateral });
            }}
            onListboxOpen={(isOpen) => setHasFocus(isOpen)}
          >
            {collateralOptions.map(
              ({ symbol, apy, collateralValue, apySuffix, tokenIcon }) => {
                const shouldCountUp = !hasFocus && symbol === selectedOptionKey;
                const apyComponent =
                  shouldCountUp && apy ? (
                    <CountUp
                      value={apy}
                      suffix={`% ${apySuffix}`}
                      decimals={2}
                    />
                  ) : (
                    <span>
                      {formatNumberAsPercent(apy)}&nbsp;{apySuffix}
                    </span>
                  );
                const collateralValueComponent =
                  shouldCountUp && collateralValue ? (
                    <CountUp value={collateralValue} decimals={2} />
                  ) : (
                    <span>{formatNumber(collateralValue, 2)}</span>
                  );

                return (
                  <StyledMenuItem
                    key={symbol}
                    value={symbol}
                    sx={{ justifyContent: 'space-between' }}
                  >
                    <StyledSymbol className="symbol">
                      <TokenIcon size="medium" symbol={tokenIcon} />
                      <H4 marginLeft={theme.spacing(2)}>{symbol}</H4>
                    </StyledSymbol>
                    <CollateralInfo>
                      <H4>{apyComponent}</H4>
                      <Caption>
                        <FormattedMessage
                          {...defineMessage({
                            defaultMessage:
                              '{value} {selectedToken} collateral value',
                            description: 'input label',
                          })}
                          values={{
                            selectedToken,
                            value: collateralValueComponent,
                          }}
                        />
                      </Caption>
                    </CollateralInfo>
                  </StyledMenuItem>
                );
              }
            )}
          </SelectDropdown>
          {/* This is where the dropdown will pop up from */}
          <div ref={dropDownRef} />
          <Paragraph marginTop={theme.spacing(1)}>
            {highestApyString ? (
              <FormattedMessage
                {...defineMessage({
                  defaultMessage: 'Earn up to {apy}',
                  description: 'input caption',
                })}
                values={{
                  apy: highestApyString,
                }}
              />
            ) : (
              // This is an empty placeholder
              '\u00A0'
            )}
          </Paragraph>
        </div>
      )}
    </Box>
  );
};
