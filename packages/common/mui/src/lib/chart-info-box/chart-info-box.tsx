import { SetStateAction, Dispatch, ReactNode } from 'react';
import { useTheme, Box, styled } from '@mui/material';
import { CloseX } from '@notional-finance/icons';

export interface chartInfoBoxDataProps {
  TextComponent: ReactNode;
}

export interface ChartInfoBoxProps {
  setChartInfoBoxActive: Dispatch<SetStateAction<boolean | undefined>>;
  chartInfoBoxActive?: boolean;
  chartInfoBoxData: chartInfoBoxDataProps[];
}

export const ChartInfoBox = ({
  setChartInfoBoxActive,
  chartInfoBoxActive,
  chartInfoBoxData,
}: ChartInfoBoxProps) => {
  const theme = useTheme();

  const mountedStyle = {
    animation: 'inAnimation 250ms ease-in',
  };
  const unmountedStyle = {
    animation: 'outAnimation 200ms ease-out',
    animationFillMode: 'forwards',
  };

  return (
    <FadeContainer>
      <Box
        sx={{
          display: 'block',
          padding: theme.spacing(4),
          paddingTop: '0px',
          width: theme.spacing(96),
          height: theme.spacing(52),
          marginLeft: `-${theme.spacing(3)}`,
          ...(chartInfoBoxActive ? mountedStyle : unmountedStyle),
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ width: '100%', background: 'transparent' }}></Box>
          <IconContainer>
            <CloseX
              onClick={() => setChartInfoBoxActive(false)}
              sx={{
                cursor: 'pointer',
                stroke: theme.palette.common.black,
                marginTop: theme.spacing(1),
              }}
            />
          </IconContainer>
        </Box>
        <Box
          sx={{
            background: theme.palette.common.white,
            height: '100%',
          }}
        >
          <InfoBoxData>
            {chartInfoBoxData.map(({ TextComponent }, index) => (
              <div key={index}>{TextComponent}</div>
            ))}
          </InfoBoxData>
        </Box>
      </Box>
    </FadeContainer>
  );
};

const InfoBoxData = styled(Box)(
  ({ theme }) => `
  border: ${theme.shape.borderStandard};
  border-radius: ${theme.shape.borderRadius()};
  background: ${theme.palette.background.default};
  width: 100%;
  height: 80%;
  padding: ${theme.spacing(3)};
`
);

const IconContainer = styled(Box)(
  ({ theme }) => `
  display: block;
  width: ${theme.spacing(35)};
  height: ${theme.spacing(8)};
  text-align: right;
  background: ${theme.palette.common.white};
`
);

const FadeContainer = styled(Box)(
  `
  position: absolute;
  width: 100%;
  @keyframes inAnimation {
    0% {
      opacity: 0;
      display: none;
    }
    100% {
      opacity: 1;
      display: block;
    }
  }
  
  @keyframes outAnimation {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
      display: none;
    }
  }
`
);

export default ChartInfoBox;
