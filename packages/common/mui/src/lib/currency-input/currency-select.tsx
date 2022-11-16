import { styled } from '@mui/material/styles';
import OptionUnstyled from '@mui/base/OptionUnstyled';
import { NotionalTheme } from '@notional-finance/styles';
import { Button, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import { ForwardedRef, ReactNode, useEffect, useState } from 'react';
import { SelectDropdown } from '../select-dropdown/select-dropdown';
import { H4 } from '../typography/typography';

export interface CurrencySelectProps {
  currencies: string[];
  landingPage?: boolean;
  defaultValue?: string;
  onSelectChange?: (value: string | null) => void;
  popperRef?: ForwardedRef<unknown>;
  children?: ReactNode;
}

const StyledItem = styled(OptionUnstyled)(
  ({ theme }) => `
  font-family: ${theme.typography.fontFamily};
  padding: ${theme.spacing(1, 2)};
  display: flex;
  line-height: 1.4;
  align-items: center;

  &:hover {
    background-color: ${theme.palette.background.default};
    cursor: pointer;
  }
  `
);

const StyledButton = styled(Button)`
  min-width: 140px;
  margin-top: -0.5rem;
  margin-bottom: -0.5rem;
  flex-grow: 1;
  align-self: stretch;
  padding-right: 1rem;
  padding-left: 1rem;
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  .MuiButton-endIcon {
    margin-right: 0px;
    margin-left: auto;
  }
`;

export function CurrencySelect(props: CurrencySelectProps) {
  const {
    defaultValue,
    currencies,
    onSelectChange,
    landingPage = false,
    popperRef,
  } = props;
  const theme = useTheme() as NotionalTheme;
  const [value, setValue] = useState<string | null>(
    defaultValue || currencies[0]
  );

  useEffect(() => {
    // If the default changes and is not undefined then set it as selected
    if (defaultValue && defaultValue !== value) setValue(defaultValue);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultValue]);

  return (
    <SelectDropdown
      popperRef={popperRef}
      value={value}
      buttonComponent={StyledButton}
      landingPage={landingPage}
      onChange={(value: string | null) => {
        setValue(value);
        if (onSelectChange) onSelectChange(value);
      }}
    >
      {currencies.map((c) => {
        return (
          <StyledItem value={c} key={c} theme={theme}>
            <TokenIcon symbol={c} size="medium" />
            <H4 marginLeft={theme.spacing(1)}>{c}</H4>
          </StyledItem>
        );
      })}
    </SelectDropdown>
  );
}

export default CurrencySelect;
