import { Box, useTheme, styled, Button } from '@mui/material';
import { MessageDescriptor } from 'react-intl';
import { TokenDefinition } from '@notional-finance/core-entities';
import {
  EmptyCurrencySelectOption,
  formatOption,
} from '../currency-input/currency-select';
import { Paragraph } from '../typography/typography';
import { SelectDropdown } from '../select-dropdown/select-dropdown';
import { InputLabel } from '../input-label/input-label';

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

export const AssetSelectDropdown = ({
  inputLabel,
  tightMarginTop,
  selectedTokenId,
  onSelect,
  options,
  caption,
}: AssetSelectDropdownProps) => {
  console.log({
    inputLabel,
    tightMarginTop,
    selectedTokenId,
    onSelect,
    options,
    caption,
  });
  const theme = useTheme();
  const emptyOption = EmptyCurrencySelectOption(theme);

  const selectOptions = options?.map(
    ({ token, largeFigure, largeFigureSuffix, caption, disabled }) => {
      return formatOption(
        {
          token: token,
          content: {
            largeFigure,
            largeFigureSuffix,
            shouldCountUp: false,
            caption,
          },
          disabled,
        },
        theme
      );
    }
  ) || [emptyOption];

  return (
    <Box marginTop={tightMarginTop ? theme.spacing(-3) : undefined}>
      <InputLabel inputLabel={inputLabel} />
      <SelectDropdown
        buttonComponent={StyledButton}
        value={selectedTokenId || null}
        onChange={onSelect}
        renderValue={(opt) => {
          const o = options?.find(({ token }) => token.id === opt?.value);
          return o
            ? formatOption(
                {
                  token: o.token,
                  content: {
                    largeFigure: o.largeFigure,
                    largeFigureSuffix: o.largeFigureSuffix,
                    shouldCountUp: true,
                    caption: o.caption,
                  },
                },
                theme,
                false
              )
            : undefined;
        }}
      >
        {selectOptions}
      </SelectDropdown>
      <Paragraph marginTop={theme.spacing(1)}>{caption || '\u00A0'}</Paragraph>
    </Box>
  );
};
