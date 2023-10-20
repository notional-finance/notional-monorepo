import { SetStateAction, Dispatch } from 'react';
import { Box, styled, useTheme } from '@mui/material';
import { Caption } from '@notional-finance/mui';
import { MARKET_TYPE } from '@notional-finance/util';
import { FilterIcon } from '@notional-finance/icons';
import { useMarketsMobileNav } from '../hooks';
import { FormattedMessage } from 'react-intl';
import { NotionalTheme, colors } from '@notional-finance/styles';

interface CustomLinkProps {
  marketType?: MARKET_TYPE;
  id?: MARKET_TYPE;
  theme: NotionalTheme;
}

interface MarketsMobileNavProps {
  setMarketType: Dispatch<SetStateAction<MARKET_TYPE>>;
  marketType: MARKET_TYPE;
  filterOpen: boolean;
  setFilterOpen: Dispatch<SetStateAction<boolean>>;
}

export function MarketsMobileNav({
  marketType,
  setMarketType,
  filterOpen,
  setFilterOpen,
}: MarketsMobileNavProps) {
  const theme = useTheme();
  const options = useMarketsMobileNav(setMarketType, marketType);

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
        <NavOption>
          {options.map(({ title, Icon, id }, index) => (
            <CustomLink
              key={`${index}-${id}`}
              id={id}
              theme={theme}
              marketType={marketType}
              onClick={() => setMarketType(id)}
              sx={{ marginRight: theme.spacing(2) }}
            >
              <Box>{Icon}</Box>
              <Title id={id} theme={theme} marketType={marketType}>
                {title}
              </Title>
            </CustomLink>
          ))}
        </NavOption>
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
            marketType={marketType}
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
            <Title className="title" theme={theme} marketType={marketType}>
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
  shouldForwardProp: (prop: string) => prop !== 'marketType' && prop !== 'id',
})(
  ({ marketType, id, theme }: CustomLinkProps) => `
  background: ${
    marketType === id ? theme.palette.background.paper : 'transparent'
  };
  padding: ${theme.spacing(0.5, 1)};
  border-radius: ${theme.shape.borderRadiusLarge};
  min-width: ${theme.spacing(10)};
`
);

const Title = styled(Caption, {
  shouldForwardProp: (prop: string) => prop !== 'marketType' && prop !== 'id',
})(
  ({ marketType, id, theme }: CustomLinkProps) => `
  font-weight: ${
    marketType === id
      ? theme.typography.fontWeightMedium
      : theme.typography.fontWeightRegular
  };
  color: ${
    marketType === id
      ? theme.palette.typography.main
      : theme.palette.typography.light
  };
`
);

export default MarketsMobileNav;
