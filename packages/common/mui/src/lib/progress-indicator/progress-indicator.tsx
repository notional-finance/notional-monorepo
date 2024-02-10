import { Player, Controls } from '@lottiefiles/react-lottie-player';
import {
  CircularProgress,
  LinearProgress,
  SxProps,
  Box,
  styled,
} from '@mui/material';
import NotionalLogo from '../../assets/icons/notional_lottie.json';

export interface StyledProgressIndicatorProps {
  type?: 'linear' | 'circular' | 'notional';
}

export interface ProgressIndicatorProps {
  type?: 'linear' | 'circular' | 'notional';
  width?: '25' | '50' | '60' | '75' | '100';
  circleSize?: number;
  size?: number;
  sx?: SxProps;
}

export const ProgressIndicator = ({
  type = 'circular',
  circleSize,
  width = '100',
  sx,
  ...rest
}: ProgressIndicatorProps) => {
  return (
    <StyledProgressIndicator
      type={type}
      sx={{
        ...sx,
      }}
    >
      <div className={`width-size-${width}`}>
        <div className="progress-indicator">
          {type === 'linear' && (
            <div className="progress-indicator-linear">
              <LinearProgress
                {...rest}
                className="progress-indicator-linear"
                color="inherit"
              />
            </div>
          )}
          {type === 'notional' && (
            <div className="progress-indicator-notional">
              <Player
                autoplay
                loop
                src={NotionalLogo}
                style={{ height: `${width}px`, width: `${width}px` }}
              >
                <Controls visible={false} />
              </Player>
            </div>
          )}
          {type === 'circular' && (
            <div className="progress-indicator-circular">
              <CircularProgress
                {...rest}
                size={circleSize}
                classes={{
                  colorPrimary: 'color-circular-primary',
                  colorSecondary: 'color-circular-secondary',
                }}
              />
            </div>
          )}
        </div>
      </div>
    </StyledProgressIndicator>
  );
};

const StyledProgressIndicator = styled(Box, {
  shouldForwardProp: (prop: string) => prop !== 'type',
})(
  ({ type }: StyledProgressIndicatorProps) => `
  height: 100%;
  width: 100%;
  ${
    type === 'circular' || type === 'notional'
      ? `
  display: flex;
  justify-content: center;
  align-items: center;
  `
      : 'display: inline-block;'
  }
  .progress-indicator {
    width: inherit;
    margin: 0 auto;

    .progress-indicator-circular {
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .width-size-10 {
    width: 10%;
  }
  .width-size-25 {
    width: 25%;
  }
  .width-size-50 {
    width: 50%;
  }
  .width-size-60 {
    width: 60%;
  }
  .width-size-75 {
    width: 75%;
  }
`
);

export default ProgressIndicator;
