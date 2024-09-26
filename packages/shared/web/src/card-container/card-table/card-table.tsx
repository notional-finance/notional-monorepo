import React from 'react';
import { useTheme, styled, Box } from '@mui/material';
import { colors } from '@notional-finance/styles';
import { useCardTable } from './use-card-table';
import useCardSubNav from '../card-sub-nav/use-card-sub-nav';

export const CardTable = () => {
  const theme = useTheme();
  const cardTableData = useCardTable();
  // This is used to determine the width of the table
  const links = useCardSubNav();

  return (
    <OuterContainer>
      <ContentContainer
        sx={{
          width: links.length > 3 ? theme.spacing(40) : theme.spacing(48),
        }}
      >
        {cardTableData?.map(({ key, value }, index) => (
          <React.Fragment key={index}>
            <TableContent
              sx={{
                justifyContent: 'flex-end',
                paddingRight: theme.spacing(3),
                width: '60%',
              }}
            >
              {key}
            </TableContent>
            <TableContent
              sx={{
                justifyContent: 'flex-start',
                paddingLeft: theme.spacing(3),
                width: '40%',
              }}
            >
              {value}
            </TableContent>
          </React.Fragment>
        ))}
      </ContentContainer>
    </OuterContainer>
  );
};

const OuterContainer = styled(Box)(
  ({ theme }) => `
  border: ${theme.shape.borderHighlight};
  padding: ${theme.spacing(2, 2)};
  background: ${colors.black};
  color: ${colors.white};
  width: fit-content;
  height: fit-content;
  border-radius: ${theme.shape.borderRadiusLarge};
  ${theme.breakpoints.down('sm')} {
    margin-top: ${theme.spacing(6)};
    padding: ${theme.spacing(2)};
  }
`
);

const ContentContainer = styled('ul')(
  ({ theme }) => `
  display: flex;
  flex-wrap: wrap;
  text-align: center;
  position: relative;
  margin: 0;
  &::before {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: linear-gradient(to right, ${
      colors.black
    } 0%, rgba(255, 255, 255, 0) 50%, ${colors.black} 101%);
    z-index: 1;
  }
  &::after {
    position: absolute;
    content: "";
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    background-image: linear-gradient(to top, ${
      colors.black
    } 0%, rgba(255, 255, 255, 0) 40%, ${colors.black} 120%);
    z-index: 1;
  }
  h6, div {
    z-index: 2;
    color: ${colors.white};
    position: relative;
  }
  svg {
    z-index: 2;
    fill: ${colors.neonTurquoise};
    position: relative;
  }
  ${theme.breakpoints.down('sm')} {
    width: ${theme.spacing(40.25)};
  }
`
);

const TableContent = styled('li')(
  ({ theme }) => `
  display: flex;
  position: relative;
  padding: ${theme.spacing(1.5, 0)};
  &::before {
    position: absolute;
    content: "";
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-right: ${theme.shape.borderHighlight};
    border-bottom: ${theme.shape.borderHighlight};
  }
`
);

export default CardTable;
