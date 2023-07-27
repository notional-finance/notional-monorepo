import { useEffect, useState, ReactNode } from 'react';
import { ChevronDownIcon, FilterIcon } from '@notional-finance/icons';
import { H4 } from '../typography/typography';
import { Checkbox, styled, useTheme, Box } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

interface DropDownOptionProps {
  isOpen: boolean;
  theme: NotionalTheme;
}
interface ItemProps {
  isSelected: boolean;
  theme: NotionalTheme;
}
export interface SelectedOptions {
  id: string;
  title: string;
  icon?: ReactNode;
}

interface MultiSelectDropdownProps {
  options: {
    id: string;
    title: string;
    icon?: ReactNode;
  }[];
  selected: SelectedOptions[];
  setSelected: any;
  placeHolderText: ReactNode;
  clearQueryAndFilters?: () => void;
}

export const MultiSelectDropdown = ({
  options,
  selected,
  setSelected,
  placeHolderText,
  clearQueryAndFilters,
}: MultiSelectDropdownProps) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    options.length === selected.length
      ? setAllSelected(true)
      : setAllSelected(false);
  }, [options, selected, setAllSelected]);

  const toggleOption = (option) => {
    if (allSelected) setAllSelected(false);
    setSelected((prevSelected) => {
      const newArray = [...prevSelected];
      if (newArray.find(({ id }) => id === option.id)) {
        return newArray.filter(({ id }) => id !== option.id);
      } else {
        newArray.push(option);
        return newArray;
      }
    });
    if (clearQueryAndFilters) clearQueryAndFilters();
  };

  const handleSelectAll = () => {
    if (!allSelected) {
      setSelected(options);
      setAllSelected(true);
    } else {
      setAllSelected(false);
      setSelected([]);
    }
  };

  const displayOptions = options.filter((option) =>
    selected.find(({ id }) => id === option.id)
  );

  return (
    <Wrapper
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <SelectDropdown>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <FilterIcon
            sx={{
              fill: theme.palette.common.black,
              height: theme.spacing(2.25),
              marginRight: theme.spacing(1),
            }}
          />
          {displayOptions.length > 0 && (
            <Text>
              {selected.length} <FormattedMessage defaultMessage={'selected'} />
            </Text>
          )}
          {displayOptions.length <= 0 && <Text>{placeHolderText}</Text>}
        </Box>
        <ChevronDownIcon
          fillone={theme.palette.typography.accent}
          filltwo={theme.palette.primary.contrastText}
        />
      </SelectDropdown>
      <DropdownOptions isOpen={isOpen} theme={theme}>
        <DropdownOption>
          <Item
            onClick={handleSelectAll}
            isSelected={allSelected}
            theme={theme}
          >
            <Text>
              <FormattedMessage defaultMessage={'Select All'} />
            </Text>
            <Checkbox
              sx={{
                color: theme.palette.borders.paper,
                fill: theme.palette.common.white,
                '&.Mui-checked': {
                  color: theme.palette.typography.accent,
                },
              }}
              checked={allSelected}
            />
          </Item>
          {options.map((option) => {
            const isSelected = selected.find(({ id }) => id === option.id)
              ? true
              : false;
            return (
              <Item
                key={option.id}
                isSelected={isSelected}
                onClick={() => toggleOption(option)}
                theme={theme}
              >
                <Text sx={{ display: 'flex', alignItems: 'center' }}>
                  {option?.icon && (
                    <Box
                      component="span"
                      sx={{
                        marginRight: theme.spacing(1),
                        marginTop: theme.spacing(0.5),
                      }}
                    >
                      {option.icon}
                    </Box>
                  )}
                  <Box component="span">{option.title}</Box>
                </Text>
                <Checkbox
                  sx={{
                    color: theme.palette.borders.paper,
                    fill: theme.palette.common.white,
                    '&.Mui-checked': {
                      color: theme.palette.typography.accent,
                    },
                  }}
                  checked={isSelected}
                />
              </Item>
            );
          })}
        </DropdownOption>
      </DropdownOptions>
    </Wrapper>
  );
};

const Wrapper = styled(Box)(
  ({ theme }) => `
    cursor: pointer;
    margin-right: ${theme.spacing(3)};
    position: relative;
    width: ${theme.spacing(29)};
    background: ${theme.palette.common.white};
    border-radius: ${theme.shape.borderRadius()};
    border: 1px solid ${theme.palette.typography.accent};
  `
);

const Item = styled('ul', {
  shouldForwardProp: (prop: string) => prop !== 'isSelected',
})(
  ({ isSelected, theme }: ItemProps) => `
    padding: 6px 10px;
    padding-right: 0px;
    height: ${theme.spacing(6)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${
      isSelected ? theme.palette.info.light : theme.palette.common.white
    };
    &:hover {
      background: ${theme.palette.info.light};
    }
  `
);

const SelectDropdown = styled(Box)(`
    border: 1px solid #eee;
    font-size: 14px;
    padding: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border: 1px solid transparent;
    border-radius: 6px;
    > img: {
        height: 18px;
    },
`);

const DropdownOptions = styled('ul', {
  shouldForwardProp: (prop: string) => prop !== 'isOpen',
})(
  ({ isOpen, theme }: DropDownOptionProps) => `
    display: ${isOpen ? 'block' : 'none'};
    position: absolute;
    box-sizing: border-box;
    left: 0;
    width: 100%;
    list-style: none;
    padding: 0px;
    border: 1px solid ${theme.palette.borders.paper};
    background: ${theme.palette.common.white};
    z-index: 9;
`
);

const DropdownOption = styled('li')(`
    display: block;
    align-items: center;
    cursor: pointer;
  
    &-checkbox: {
      margin-right: 6px;
    },
  `);

const Text = styled(H4)(`
    font-weight: 500;
  `);

export default MultiSelectDropdown;
