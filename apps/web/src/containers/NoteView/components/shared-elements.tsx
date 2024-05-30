import { useTheme, Box, styled, alpha } from '@mui/material';
import { H2, Subtitle, LabelValue } from '@notional-finance/mui';
import { ReactNode } from 'react';
import { TokenIcon } from '@notional-finance/icons';
import { colors } from '@notional-finance/styles';
import {
  formatNumber,
  formatNumberAsPercentWithUndefined,
} from '@notional-finance/helpers';

interface SectionTitleProps {
  symbol?: string;
  title: ReactNode;
}
interface PercentAndDateProps {
  percentChange?: number;
  dateRange: string;
}
interface DualColorValueProps {
  value: number;
  prefix?: string;
  suffix?: string;
}
interface SquareGridBgProps {
  height: string;
  width?: string;
}

export const NotePageSectionTitle = ({ symbol, title }: SectionTitleProps) => {
  const theme = useTheme();
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
      }}
    >
      {symbol === 'snote' && <TokenIcon symbol={'snote'} size="xl" />}
      {symbol === 'note' && <TokenIcon symbol={'note'} size="xl" />}
      <H2 sx={{ marginLeft: symbol ? theme.spacing(2) : '' }}>{title}</H2>
    </Box>
  );
};

export const PercentAndDate = ({
  percentChange,
  dateRange,
}: PercentAndDateProps) => {
  const theme = useTheme();
  const isPositive = percentChange !== undefined && percentChange >= 0;
  return (
    <Box sx={{ display: 'flex', alignItems: 'center' }}>
      <LabelValue
        sx={{
          color: isPositive ? colors.neonTurquoise : colors.red,
          marginRight: theme.spacing(1),
        }}
      >
        {`${isPositive ? '+' : ''}${formatNumberAsPercentWithUndefined(
          percentChange,
          '-',
          2
        )}`}
      </LabelValue>
      <LabelValue sx={{ fontSize: '12px', color: colors.greenGrey }}>
        {dateRange}
      </LabelValue>
    </Box>
  );
};

export const DualColorValue = ({
  value,
  suffix,
  prefix,
}: DualColorValueProps) => {
  const theme = useTheme();
  const [valueOne, valueTwo] = suffix
    ? [value.toFixed(0), suffix]
    : value.toFixed(4).split('.');
  return (
    <Box sx={{ display: 'flex' }}>
      <H2
        sx={{
          color: colors.white,
          marginRight: suffix ? theme.spacing(1) : '0px',
        }}
      >
        {prefix || ''}
        {formatNumber(valueOne, 0)}
      </H2>
      <H2 sx={{ color: colors.blueGreen }}>
        {suffix ? valueTwo : `.${valueTwo}`}
      </H2>
    </Box>
  );
};

export const SquareGridBg = ({ height }: SquareGridBgProps) => {
  return (
    <GridBackground sx={{ height: `${height} !important` }}>
      {Array(44 * 44)
        .fill(null)
        .map((_, index) => (
          <GridCell key={index} />
        ))}
    </GridBackground>
  );
};

const GridBackground = styled('div')(
  ({ theme }) => `
  position: absolute;
  overflow: hidden;
  width: 100vw !important;
  background-color: #041D2E;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(44px, 1fr));
  grid-template-rows: repeat(auto-fit, minmax(44px, 1fr));
  grid-auto-flow: row;
  z-index: 1;
  ${theme.breakpoints.down('sm')} {
    height: ${theme.spacing(175)} !important;
  }
`
);

const GridCell = styled('div')(
  `
  overflow: hidden;
  background-color: inherit; 
  border: 0.5px solid ${alpha(colors.aqua, 0.15)};
  box-sizing: border-box;
`
);

export const ContentContainer = styled(Box)(
  ({ theme }) => `
    height: 100%;
    max-width: ${theme.spacing(150)};
    margin: auto;
    padding-bottom: ${theme.spacing(15)};
    position: relative;
    z-index: 3;
    ${theme.breakpoints.down('sm')} {
      width: 90%;
    }
      `
);

export const ContentBox = styled(Box)(
  ({ theme }) => `
  height: 100%;
  width: 100%;
  padding: ${theme.spacing(3)};
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  background: #041D2E;
      `
);

export const ChartSectionContainer = styled(Box)(
  ({ theme }) => `
    width: 100%;
    height: ${theme.spacing(50)};
    display: flex;
    gap: ${theme.spacing(3)};
    ${theme.breakpoints.down('sm')} {
      flex-direction: column;
      height: 100%;
    }
      `
);

export const SubText = styled(Subtitle)(
  ({ theme }) => `
    max-width: ${theme.spacing(62)};
    padding-bottom: ${theme.spacing(4)};
      `
);

export const CardContainer = styled(Box)(
  ({ theme }) => `
      display: flex;
      gap: ${theme.spacing(3)};
      ${theme.breakpoints.down('sm')} {
        flex-direction: column;
      }
  `
);

export const CardSubText = styled(Box)(
  ({ theme }) => `
    padding-top: ${theme.spacing(3)};
    font-family: Avenir Next;
    font-size: 12px;
    font-weight: 500;
    color: ${colors.greenGrey};
  `
);
