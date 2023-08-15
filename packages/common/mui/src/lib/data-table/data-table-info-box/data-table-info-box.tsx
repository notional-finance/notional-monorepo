import { SetStateAction, Dispatch, ReactNode } from 'react';
import { useTheme, Box, styled } from '@mui/material';
import { CloseX } from '@notional-finance/icons';
import { NotionalTheme } from '@notional-finance/styles';

export interface InfoBoxDataProps {
  TextComponent: ReactNode;
}

interface ContentWrapperProps {
  height: number;
  width: number;
  theme: NotionalTheme;
}

export interface InfoBoxProps {
  setInfoBoxActive: Dispatch<SetStateAction<boolean | undefined>>;
  infoBoxActive?: boolean;
  infoBoxData: InfoBoxDataProps[];
  height: number;
  width: number;
}

export const DataTableInfoBox = ({
  setInfoBoxActive,
  infoBoxActive,
  infoBoxData,
  height,
  width,
}: InfoBoxProps) => {
  const theme = useTheme();

  const mountedStyle = {
    animation: 'inAnimation 250ms ease-in',
  };
  const unmountedStyle = {
    animation: 'outAnimation 200ms ease-out',
    animationFillMode: 'forwards',
  };

  return (
    <FadeContainer height={height} width={width} theme={theme}>
      <Box
        sx={{
          display: 'block',
          padding: theme.spacing(2),
          paddingTop: '0px',
          ...(infoBoxActive ? mountedStyle : unmountedStyle),
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ width: '100%', background: 'transparent' }}></Box>
          <IconContainer>
            <CloseX
              onClick={() => setInfoBoxActive(false)}
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
            {infoBoxData.map(({ TextComponent }, index) => (
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
  height: ${theme.spacing(10)};
  margin-top: -${theme.spacing(4.5)};
  text-align: right;
  background: ${theme.palette.background.paper};
`
);

const FadeContainer = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'height' && prop !== 'width',
})(
  ({ height, width, theme }: ContentWrapperProps) => `
  margin-top: -${height - 70}px;
  background: ${theme.palette.background.paper};
  height: ${height - 70}px;
  width: ${width - 2}px;
  position: absolute;

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

export default DataTableInfoBox;
