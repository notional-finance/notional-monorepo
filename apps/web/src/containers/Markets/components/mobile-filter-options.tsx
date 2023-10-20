import { useState } from 'react';
import { styled, Drawer, useTheme, Box, Checkbox } from '@mui/material';
import { SetStateAction, Dispatch } from 'react';
import { FormattedMessage } from 'react-intl';
import { NotionalTheme } from '@notional-finance/styles';
import { Button, H4, H5, LinkText } from '@notional-finance/mui';

interface MobileFilterOptionsProps {
  filterData: any[];
  filterOpen: boolean;
  setFilterOpen: Dispatch<SetStateAction<boolean>>;
}

interface OptionRowProps {
  isSelected: boolean;
  theme: NotionalTheme;
}

export function MobileFilterOptions({
  filterOpen,
  filterData,
  setFilterOpen,
}: MobileFilterOptionsProps) {
  const theme = useTheme();
  const [allSelected, setAllSelected] = useState(false);

  const toggleOption = (setSelected, option) => {
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
  };

  const handleCancel = () => {
    filterData.forEach(({ setSelectedOptions }) => setSelectedOptions([]));
    setAllSelected(false);
    setFilterOpen(false);
  };

  const handleSelectAll = (setSelectedOptions, data) => {
    if (!allSelected) {
      setSelectedOptions(data);
      setAllSelected(true);
    } else {
      setAllSelected(false);
      setSelectedOptions([]);
    }
  };

  return (
    <Drawer
      id="markets-mobile-drawer"
      anchor="bottom"
      open={filterOpen}
      sx={{
        display: { xs: 'block', lg: 'none' },
        color: theme.palette.common.black,
        width: 100,
        overflow: 'scroll',
        '& .MuiDrawer-paper, .MuiDrawer-paperAnchorTop': {
          top: { xs: 73, sm: 73 },
          background: theme.palette.background.paper,
          maxWidth: '100vw',
        },
      }}
    >
      <Box sx={{ marginBottom: '105px' }}>
        {filterData.map(
          (
            { selectedOptions, setSelectedOptions, data, placeHolderText },
            index
          ) => (
            <Box key={index}>
              <CategoryContainer>
                <H5>{placeHolderText}</H5>
                <SelectAll
                  onClick={() => handleSelectAll(setSelectedOptions, data)}
                >
                  <FormattedMessage defaultMessage={'Select All'} />
                </SelectAll>
              </CategoryContainer>

              <Box>
                {data.map((option) => {
                  const isSelected = selectedOptions.find(
                    ({ id }) => id === option.id
                  )
                    ? true
                    : false;
                  return (
                    <OptionRow
                      key={option.id}
                      onClick={() => toggleOption(setSelectedOptions, option)}
                      isSelected={isSelected}
                      theme={theme}
                    >
                      <Title>
                        <Box
                          sx={{
                            display: 'flex',
                            marginRight: theme.spacing(1.5),
                            svg: {
                              width: theme.spacing(3),
                              height: theme.spacing(3),
                            },
                          }}
                          component={'span'}
                        >
                          {option.icon}
                        </Box>
                        {option.title}
                      </Title>
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
                    </OptionRow>
                  );
                })}
              </Box>
            </Box>
          )
        )}
      </Box>
      <ButtonContainer>
        <Button
          variant="outlined"
          size="large"
          sx={{ width: '48%' }}
          onClick={() => handleCancel()}
        >
          <FormattedMessage defaultMessage={'Cancel'} />
        </Button>

        <Button
          variant="contained"
          size="large"
          sx={{ width: '48%' }}
          onClick={() => setFilterOpen(false)}
        >
          <FormattedMessage defaultMessage={'Apply'} />
        </Button>
      </ButtonContainer>
    </Drawer>
  );
}

const OptionRow = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'isSelected',
})(
  ({ isSelected, theme }: OptionRowProps) => `
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding: ${theme.spacing(2)};
  background: ${
    isSelected ? theme.palette.info.light : theme.palette.common.white
  };
`
);

const Title = styled(H4)(`
  display: flex;
  flex-direction: row;
  align-items: center;
`);

const SelectAll = styled(LinkText)(
  ({ theme }) => `
  color: ${theme.palette.typography.accent};
  text-decoration: underline;
  padding: ${theme.spacing(2)};
  font-size: 14px;
`
);

const CategoryContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: ${theme.spacing(2)};
  padding: ${theme.spacing(0, 2, 0, 2)};
`
);

const ButtonContainer = styled(Box)(
  ({ theme }) => `
  margin-top: ${theme.spacing(5)};
  display: inline-flex;
  justify-content: space-between;
  width: 100%;
  padding: ${theme.spacing(3)};
  position: fixed;
  bottom: 0;
  box-shadow: 0 -50px 50px -20px ${theme.palette.background.paper};
  background: ${theme.palette.background.paper};
`
);

export default MobileFilterOptions;
