import { CircularProgress, LinearProgress, styled } from '@mui/material';

export interface ProgressIndicatorProps {
  type?: 'linear' | 'circular';
  width?: '25' | '50' | '60' | '75' | '100';
  size?: number;
}

export const ProgressIndicator = ({
  type = 'circular',
  width = '100',
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
    } else {
      indicator = (
        <div className="progress-indicator-circular">
          <CircularProgress
            {...rest}
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

  return <StyledProgressIndicator>{display()}</StyledProgressIndicator>;
};

const StyledProgressIndicator = styled('div')`
  height: 100%;
  width: 100%;

  .progress-indicator {
    width: inherit;
    margin: 0 auto;

    .progress-indicator-circular {
      display: flex;
      justify-content: center;
      align-items: center;
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

export default ProgressIndicator;
