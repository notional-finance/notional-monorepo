import { Box, useTheme, styled, Button } from '@mui/material';
import OptionUnstyled from '@mui/base/OptionUnstyled';
import { MessageDescriptor } from 'react-intl';
import { InputLabel } from '../input-label/input-label';
import { useState } from 'react';
import { SelectDropdown } from '../select-dropdown/select-dropdown';
import { Caption, H4, Paragraph } from '../typography/typography';
import { TokenIcon } from '@notional-finance/icons';
import { formatTokenType } from '@notional-finance/helpers';
import { TokenDefinition } from '@notional-finance/core-entities';
import CountUp from '../count-up/count-up';

interface AssetSelectDropdownProps {
  inputLabel: MessageDescriptor;
  errorMsg?: MessageDescriptor;
  tightMarginTop?: boolean;
  selectedTokenId?: string;
  onSelect: (id: string | null) => void;
  options?: {
    token: TokenDefinition;
    largeFigure: number;
    largeFigureSuffix: string;
    caption?: React.ReactNode;
    disabled?: boolean;
  }[];
  caption?: React.ReactNode;
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
    height: ${theme.spacing(7)};
    .MuiButton-endIcon {
      margin-right: 0px;
    }
  `
);

const StyledMenuItem = styled(OptionUnstyled)(
  ({ theme }) => `
  font-family: ${theme.typography.fontFamily};
  padding: ${theme.spacing(1, 2)};
  display: flex;
  justify-content: space-between;
  line-height: ${theme.typography.body1.lineHeight};
  align-items: center;
  height: ${theme.spacing(7)};

  &:hover {
    background-color: ${theme.palette.background.default};
    cursor: pointer;
  }

  &.Mui-disabled {
    h4 {
      color: ${theme.palette.typography.light};
    }

    :hover {
      background-color: ${theme.palette.background.paper};
      cursor: default;
    }
  }
`
);

export const AssetSelectDropdown = ({
  inputLabel,
  tightMarginTop,
  selectedTokenId,
  onSelect,
  options,
  caption,
}: AssetSelectDropdownProps) => {
  const theme = useTheme();
  const [hasFocus, setHasFocus] = useState(false);
  const emptyOption = (
    <StyledMenuItem key={'null'} value={'EMPTY'}>
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
        <Caption>&nbsp;</Caption>
      </Box>
    </StyledMenuItem>
  );

  return (
    <Box marginTop={tightMarginTop ? theme.spacing(-3) : undefined}>
      <InputLabel inputLabel={inputLabel} />
      <SelectDropdown
        buttonComponent={StyledButton}
        value={selectedTokenId || null}
        onChange={onSelect}
        onListboxOpen={(isOpen) => setHasFocus(isOpen)}
      >
        {options
          ? options.map((o) => {
              const { titleWithMaturity, icon } = formatTokenType(o.token);
              const shouldCountUp = !hasFocus && o.token.id === selectedTokenId;
              const largeFigure = shouldCountUp ? (
                <CountUp
                  value={o.largeFigure}
                  suffix={` ${o.largeFigureSuffix}`}
                  decimals={3}
                />
              ) : (
                <span>
                  {o.largeFigure.toFixed(3)}&nbsp;
                  {o.largeFigureSuffix}
                </span>
              );
              return (
                <StyledMenuItem
                  key={o.token.id}
                  value={o.token.id}
                  disabled={o.disabled}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      marginRight: 'auto',
                    }}
                  >
                    <TokenIcon size="medium" symbol={icon} />
                    <H4 marginLeft={theme.spacing(2)}>{titleWithMaturity}</H4>
                  </Box>
                  <Box textAlign={'right'}>
                    <H4>{largeFigure}</H4>
                    {o.caption ? <Caption>{o.caption}</Caption> : null}
                  </Box>
                </StyledMenuItem>
              );
            })
          : [emptyOption]}
      </SelectDropdown>
      <Paragraph marginTop={theme.spacing(1)}>{caption || '\u00A0'}</Paragraph>
    </Box>
  );
};
