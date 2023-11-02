import { styled } from '@mui/material/styles';
import OptionUnstyled from '@mui/base/OptionUnstyled';
import { Box, Button, useTheme } from '@mui/material';
import { TokenIcon } from '@notional-finance/icons';
import React, { ReactNode, useEffect, useState } from 'react';
import { SelectDropdown } from '../select-dropdown/select-dropdown';
import { Caption, H4 } from '../typography/typography';
import { NotionalTheme } from '@notional-finance/styles';
import CountUp from '../count-up/count-up';
import { TokenDefinition } from '@notional-finance/core-entities';
import { formatTokenType } from '@notional-finance/helpers';

export interface CurrencySelectOption {
  token: TokenDefinition;
  // Used for cases when we want to flip the prime cash / prime debt tokens
  displayToken?: TokenDefinition;
  content?: {
    largeFigure: number;
    largeFigureSuffix: string;
    shouldCountUp: boolean;
    caption?: React.ReactNode;
  };
  disabled?: boolean;
}

export interface CurrencySelectProps {
  options: CurrencySelectOption[];
  defaultValue: string | null;
  onSelectChange?: (value: string | null) => void;
  popperRef?: React.ForwardedRef<unknown>;
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

const StyledButton = styled(Button)(
  ({ theme }) => `
  min-width: ${theme.spacing(18)};
  margin-top: ${theme.spacing(-1)};
  margin-bottom: ${theme.spacing(-1)};
  flex-grow: 1;
  align-self: stretch;
  padding-right: ${theme.spacing(2)};
  padding-left: ${theme.spacing(2)};
  border-top-left-radius: 0px;
  border-bottom-left-radius: 0px;
  .MuiButton-endIcon {
    margin-right: 0px;
    margin-left: auto;
  }
`
);

export function CurrencySelect({
  defaultValue,
  options,
  onSelectChange,
  popperRef,
}: CurrencySelectProps) {
  const [value, setValue] = useState<string | null>(defaultValue);
  const theme = useTheme();

  const parentWidth =
    popperRef && popperRef['current']
      ? popperRef['current']['clientWidth']
      : undefined;

  useEffect(() => {
    if (defaultValue && value !== defaultValue) setValue(defaultValue);
  }, [defaultValue, value]);

  return (
    <SelectDropdown
      value={value}
      buttonComponent={StyledButton}
      popperWidth={`${parentWidth}px`}
      renderValue={(opt) =>
        opt ? (
          <Box sx={{ display: 'flex', marginRight: 'auto' }}>
            <TokenIcon symbol={opt.label as string} size="medium" />
            <H4 marginLeft={theme.spacing(1)}>{opt.label}</H4>
          </Box>
        ) : undefined
      }
      onChange={(value: string | null) => {
        setValue(value);
        if (onSelectChange) onSelectChange(value);
      }}
    >
      {options.map((o) => formatOption(o, theme))}
    </SelectDropdown>
  );
}

/**
 * NOTE: odd behavior in SelectUnstyled requires that this be called
 * as a regular function, not a JSX component
 */
export const formatOption = (
  option: CurrencySelectOption,
  theme: NotionalTheme,
  wrapInOption = true
) => {
  const { icon, titleWithMaturity } = formatTokenType(
    option.displayToken || option.token
  );
  let rightContent: ReactNode | undefined;
  if (option.content) {
    const c = option.content;
    // TODO: there is no abbr here anymore.
    const largeFigure = c.shouldCountUp ? (
      <CountUp
        value={c.largeFigure}
        suffix={` ${c.largeFigureSuffix}`}
        decimals={3}
      />
    ) : (
      <span>
        {c.largeFigure.toFixed(3)}&nbsp;
        {c.largeFigureSuffix}
      </span>
    );
    rightContent = (
      <Box textAlign={'right'}>
        <H4 error={c.largeFigure < 0}>{largeFigure}</H4>
        {c.caption ? <Caption>{c.caption}</Caption> : null}
      </Box>
    );
  }
  const child = (
    <>
      <Box sx={{ display: 'flex', marginRight: 'auto' }}>
        <TokenIcon symbol={icon} size="medium" />
        <H4 marginLeft={theme.spacing(1)}>{titleWithMaturity}</H4>
      </Box>
      {rightContent && <Box textAlign="right">{rightContent}</Box>}
    </>
  );
  return wrapInOption ? (
    <StyledItem
      value={option.token.id}
      key={option.token.id}
      label={icon}
      theme={theme}
      disabled={option.disabled}
    >
      {child}
    </StyledItem>
  ) : (
    child
  );
};

export const EmptyCurrencySelectOption = (theme: NotionalTheme) => (
  <StyledItem key={'null'} value={'EMPTY'}>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginRight: 'auto',
      }}
    >
      <TokenIcon size="medium" symbol={'unknown'} />
      <H4 marginLeft={theme.spacing(2)}>&nbsp;</H4>
    </Box>
    <Box textAlign={'right'}>
      <H4>&nbsp;</H4>
    </Box>
  </StyledItem>
);

export default CurrencySelect;
