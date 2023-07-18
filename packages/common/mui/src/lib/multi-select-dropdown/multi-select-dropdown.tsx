import { useEffect, useState, ReactNode } from 'react';
import { ChevronDownIcon, FilterIcon } from '@notional-finance/icons';
import { H4 } from '../typography/typography';
import { Checkbox, styled, useTheme, Box } from '@mui/material';
import { NotionalTheme } from '@notional-finance/styles';
import { FormattedMessage } from 'react-intl';

interface TestProps {
  isOpen: boolean;
  theme: NotionalTheme;
}
interface TestTwoProps {
  isSelected: boolean;
  theme: NotionalTheme;
}

interface MultiSelectDropdownProps {
  options: {
    id: string;
    title: string;
  }[];
  selected: string[];
  setSelected: any;
  placeHolderText: ReactNode;
}

export const MultiSelectDropdown = ({
  options,
  selected,
  setSelected,
  placeHolderText,
}: MultiSelectDropdownProps) => {
  const theme = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [allSelected, setAllSelected] = useState(false);

  useEffect(() => {
    options.length === selected.length
      ? setAllSelected(true)
      : setAllSelected(false);
  }, [options, selected, setAllSelected]);

  const toggleOption = ({ id }) => {
    if (allSelected) setAllSelected(false);
    setSelected((prevSelected) => {
      const newArray = [...prevSelected];
      if (newArray.includes(id)) {
        return newArray.filter((item) => item != id);
      } else {
        newArray.push(id);
        return newArray;
      }
    });
  };

  const handleSelectAll = () => {
    if (!allSelected) {
      const formattedOptions = options.map(({ id }) => id);
      setSelected(formattedOptions);
      setAllSelected(true);
    } else {
      setAllSelected(false);
      setSelected([]);
    }
  };

  const displayOptions = options.filter(({ id }) => selected.includes(id));

  return (
    <Wrapper
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <SelectDropdown>
        <FilterIcon
          sx={{
            fill: theme.palette.common.black,
            fontSize: '1.125rem',
          }}
        />
        {/* {displayOptions.length > 0 &&
          displayOptions.map((option) => <Text>{option.title}</Text>)} */}
        {displayOptions.length > 0 && <Text>{selected.length} selected</Text>}
        {displayOptions.length <= 0 && <Text>{placeHolderText}</Text>}
        <ChevronDownIcon />
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
                fill: 'white',
                '&.Mui-checked': {
                  color: theme.palette.typography.accent,
                },
              }}
              checked={allSelected}
            />
          </Item>
          {options.map((option) => {
            const isSelected = selected.includes(option.id);
            return (
              <Item
                key={option.id}
                isSelected={isSelected}
                onClick={() => toggleOption({ id: option.id })}
                theme={theme}
              >
                <Text>{option.title}</Text>
                <Checkbox
                  sx={{
                    color: theme.palette.borders.paper,
                    fill: 'white',
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
    margin: ${theme.spacing(12.5)} auto;
    position: relative;
    width: ${theme.spacing(25)};
    background: ${theme.palette.common.white};
    border-radius: ${theme.shape.borderRadius()};
    border: 1px solid ${theme.palette.typography.accent};

  `
);

const Item = styled('ul', {
  shouldForwardProp: (prop: string) => prop !== 'isSelected',
})(
  ({ isSelected, theme }: TestTwoProps) => `
    padding: 6px 10px;
    padding-right: 0px;
    height: ${theme.spacing(6)};
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: ${
      isSelected ? theme.palette.info.light : theme.palette.common.white
    };
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
  ({ isOpen, theme }: TestProps) => `
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
