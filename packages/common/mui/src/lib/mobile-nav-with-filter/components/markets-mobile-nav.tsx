import { SetStateAction, Dispatch } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { Caption } from '../../typography/typography';
import { MARKET_TYPE } from '@notional-finance/util';
import { FilterIcon } from '@notional-finance/icons';
import { FormattedMessage } from 'react-intl';
import { NotionalTheme, colors } from '@notional-finance/styles';

interface CustomLinkProps {
  earnBorrowOption: number;
  dataKey?: number;
  theme: NotionalTheme;
}

interface MarketsMobileNavProps {
  setEarnBorrowOption?: (v: number) => void;
  earnBorrowOption?: number;
  filterOpen: boolean;
  options?: any[];
  setFilterOpen: Dispatch<SetStateAction<boolean>>;
}

export function MarketsMobileNav({
  earnBorrowOption = 0,
  setEarnBorrowOption,
  filterOpen,
  options,
  setFilterOpen,
}: MarketsMobileNavProps) {
  const theme = useTheme();

  return (
    <MobileNavContainer>
      <Box
        sx={{
          display: 'flex',
          width: '100vw',
          paddingLeft: theme.spacing(3),
          paddingRight: theme.spacing(3),
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        {options && options.length > 0 && setEarnBorrowOption && (
          <NavOption>
            {options.map(({ title, Icon, id }, index) => (
              <CustomLink
                key={`${index}-${id}`}
                dataKey={id}
                theme={theme}
                earnBorrowOption={earnBorrowOption}
                onClick={() => setEarnBorrowOption(id)}
                sx={{ marginRight: theme.spacing(2) }}
              >
                <Box>{Icon}</Box>
                <Title
                  dataKey={id}
                  theme={theme}
                  earnBorrowOption={earnBorrowOption}
                >
                  {title}
                </Title>
              </CustomLink>
            ))}
          </NavOption>
        )}
        <NavOption
          sx={{
            background: colors.matteGreen,
            '.title': {
              color: theme.palette.typography.accent,
            },
            svg: {
              fill: theme.palette.typography.accent,
            },
            borderRadius: theme.shape.borderRadiusLarge,
          }}
        >
          <CustomLink
            theme={theme}
            earnBorrowOption={earnBorrowOption}
            onClick={() => setFilterOpen(!filterOpen)}
          >
            <Box>
              <FilterIcon
                id="filter-icon"
                sx={{
                  width: theme.spacing(2),
                  fill: theme.palette.typography.light,
                }}
              />
            </Box>
            <Title
              className="title"
              theme={theme}
              earnBorrowOption={earnBorrowOption}
            >
              <FormattedMessage defaultMessage={'Filter'} />
            </Title>
          </CustomLink>
        </NavOption>
      </Box>
    </MobileNavContainer>
  );
}

const MobileNavContainer = styled(Box)(
  ({ theme }) => `
  display: none;
  ${theme.breakpoints.down('sm')} {
    background: ${theme.palette.background.accentDefault};
    height: ${theme.spacing(9)};
    display: flex;
    width: 100%;    
    z-index: 2;
    position: fixed;
    bottom: 0;
    left: 0;
  }
`
);

const NavOption = styled(Box)(`
  text-align: center;
  display: flex;
  align-items: center;
`);

const CustomLink = styled(Box, {
  shouldForwardProp: (prop: string) =>
    prop !== 'earnBorrowOption' && prop !== 'dataKey',
})(
  ({ earnBorrowOption, dataKey, theme }: CustomLinkProps) => `
  background: ${
    earnBorrowOption === dataKey
      ? theme.palette.background.paper
      : 'transparent'
  };
  padding: ${theme.spacing(0.5, 1)};
  border-radius: ${theme.shape.borderRadiusLarge};
  min-width: ${theme.spacing(10)};
`
);

const Title = styled(Caption, {
  shouldForwardProp: (prop: string) =>
    prop !== 'earnBorrowOption' && prop !== 'dataKey',
})(
  ({ earnBorrowOption, dataKey, theme }: CustomLinkProps) => `
  font-weight: ${
    earnBorrowOption === dataKey
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular
  };
  color: ${
    earnBorrowOption === dataKey
      ? theme.palette.typography.main
      : theme.palette.typography.light
  };
`
);

export default MarketsMobileNav;
