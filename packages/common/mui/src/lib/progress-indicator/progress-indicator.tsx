import { Player, Controls } from '@lottiefiles/react-lottie-player';
import {
  CircularProgress,
  LinearProgress,
  SxProps,
  styled,
} from '@mui/material';
import NotionalLogo from '../../assets/icons/notional_lottie.json';

export interface ProgressIndicatorProps {
  type?: 'linear' | 'circular' | 'notional' | 'vertical-lines';
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
  const display = () => {
    let indicator;

    if (type === 'linear') {
      indicator = (
        <div className="progress-indicator-linear">
          <LinearProgress
            {...rest}
            classes={{
              colorPrimary: 'color-primary',
              colorSecondary: 'color-secondary',
              barColorPrimary: 'bar-color-primary',
              barColorSecondary: 'bar-color-secondary',
            }}
            className="progress-indicator-linear"
          />
        </div>
      );
    } else if (type === 'notional') {
      indicator = (
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
      );
    } else if (type === 'vertical-lines') {
      indicator = (
        <VeritalLoader>
          <div className="progress-indicator-vertical-lines"></div>
        </VeritalLoader>
      );
    } else {
      indicator = (
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
      );
    }

    return (
      <div className={`width-size-${width}`}>
        <div className="progress-indicator">{indicator}</div>
      </div>
    );
  };

  return (
    <StyledProgressIndicator sx={{ ...sx }}>
      {display()}
    </StyledProgressIndicator>
  );
};

const StyledProgressIndicator = styled('div')`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  .progress-indicator {
    width: inherit;
    margin: 0 auto;

    .progress-indicator-circular {
      display: flex;
      justify-content: center;
      align-items: center;
      color: black;
    }
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
`;

const VeritalLoader = styled('div')`
  height: 40px;
  width: 40px;
  .progress-indicator-vertical-lines,
  .progress-indicator-vertical-lines:before,
  .progress-indicator-vertical-lines:after {
    background: #ffffff;
    -webkit-animation: load1 1s infinite ease-in-out;
    animation: load1 1s infinite ease-in-out;
    width: 1em;
    height: 4em;
  }
  .progress-indicator-vertical-lines {
    color: #ffffff;
    text-indent: -9999em;
    margin: 88px auto;
    position: relative;
    font-size: 11px;
    -webkit-transform: translateZ(0);
    -ms-transform: translateZ(0);
    transform: translateZ(0);
    -webkit-animation-delay: -0.16s;
    animation-delay: -0.16s;
  }
  .progress-indicator-vertical-lines:before,
  .progress-indicator-vertical-lines:after {
    position: absolute;
    top: 0;
    content: '';
  }
  .progress-indicator-vertical-lines:before {
    left: -1.5em;
    -webkit-animation-delay: -0.32s;
    animation-delay: -0.32s;
  }
  .progress-indicator-vertical-lines:after {
    left: 1.5em;
  }
  @-webkit-keyframes load1 {
    0%,
    80%,
    100% {
      box-shadow: 0 0;
      height: 4em;
    }
    40% {
      box-shadow: 0 -2em;
      height: 5em;
    }
  }
  @keyframes load1 {
    0%,
    80%,
    100% {
      box-shadow: 0 0;
      height: 4em;
    }
    40% {
      box-shadow: 0 -2em;
      height: 5em;
    }
  }
`;

export default ProgressIndicator;
