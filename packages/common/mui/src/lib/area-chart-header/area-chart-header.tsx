import React, { ReactElement } from 'react';
import { H4 } from '../typography/typography';
import { Box, styled, useTheme } from '@mui/material';

export interface AreaHeaderData {
  leftHeader?: ReactElement<any, any>;
  legendOne?: ReactElement<any, any>;
  legendTwo?: ReactElement<any, any>;
}

export const AreaChartHeader = ({
  leftHeader,
  legendOne,
  legendTwo,
}: AreaHeaderData) => {
  const theme = useTheme();

  return (
    <HeadingContainer>
      {leftHeader && <H4>{leftHeader}</H4>}

      <Legend>
        {legendOne && (
          <LegendItem
            inline
            sx={{
              borderColor: theme.palette.primary.light,
              borderStyle: 'solid',
            }}
          >
            {legendOne}
          </LegendItem>
        )}

        {legendTwo && (
          <LegendItem
            inline
            sx={{
              borderColor: theme.palette.success.main,
              borderStyle: 'dotted',
              visibility: 'visible',
            }}
          >
            {legendTwo}
          </LegendItem>
        )}
      </Legend>
    </HeadingContainer>
  );
};

const Legend = styled('span')`
  align-items: center;
  display: flex;
`;

const LegendItem = styled(H4)(
  ({ theme }) => `
  margin-left: ${theme.spacing(3)};
  padding-left: ${theme.spacing(2)};
  border-left: 2px;
  border-top: 0px;
  border-right: 0px;
  border-bottom: 0px;
`
);

const HeadingContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  margin-bottom: ${theme.spacing(3)};
`
);

export default AreaChartHeader;
