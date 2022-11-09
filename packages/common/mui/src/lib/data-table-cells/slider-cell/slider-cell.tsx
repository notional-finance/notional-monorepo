import { Box } from '@mui/material';
import { RailGradient, SliderBasic } from '../../slider-basic/slider-basic';
import { Paragraph } from '../../typography/typography';

interface SliderCellProps {
  cell: {
    value?: {
      value: number;
      trackColor?: string;
      captionLeft?: React.ReactNode;
      captionRight?: React.ReactNode;
      railGradients?: RailGradient[];
      min?: number;
      max?: number;
      hideThumb?: boolean;
      stepSize?: number;
    };
  };
}

export const SliderCell = ({ cell }: SliderCellProps): JSX.Element => {
  // Cell may be undefined in the yield holdings table
  if (!cell.value) return <></>;

  const {
    value,
    trackColor,
    captionLeft,
    captionRight,
    min,
    max,
    stepSize,
    railGradients,
    hideThumb,
  } = cell.value;
  const hasCaption = captionRight || captionLeft;

  // Ensures that the slider margins account for the caption
  const margins = hasCaption
    ? {
        marginBottom: '3px',
        marginTop: '-5px',
      }
    : {
        marginBottom: '0px',
      };

  return (
    <Box>
      <SliderBasic
        min={min || 0}
        max={max || 100}
        value={value}
        disabled={true}
        step={stepSize || 0.01}
        trackColor={trackColor}
        sx={margins}
        hideThumb={hideThumb}
        railGradients={railGradients}
      />
      {hasCaption && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Paragraph inline sx={{ textAlign: 'left', marginTop: '-5px' }}>
            {captionLeft}
          </Paragraph>
          <Paragraph inline sx={{ textAlign: 'right', marginTop: '-5px' }}>
            {captionRight}
          </Paragraph>
        </Box>
      )}
    </Box>
  );
};

export default SliderCell;
