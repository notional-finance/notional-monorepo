import { Box, styled, SxProps, useTheme } from '@mui/material';
import { MessageDescriptor } from 'react-intl';
import SliderBasic, { CustomMark } from '../slider-basic/slider-basic';
import TradeSummaryBox from '../trade-summary-box/trade-summary-box';
import { Label, LabelValue } from '../typography/typography';

interface SliderDisplayProps {
  min: number;
  max: number;
  value: number;
  captionLeft?: {
    title?: MessageDescriptor;
    value?: React.ReactNode | string;
  };
  captionRight?: {
    title?: MessageDescriptor;
    value?: React.ReactNode | string;
  };
  marks?: CustomMark[];
  sx?: SxProps;
}

const SliderContainer = styled(Box)`
  width: 100%;
  height: 100%;
`;

const CaptionContainer = styled(Box)(
  ({ theme }) => `
  display: flex;
  justify-content: space-between;
  margin-bottom: ${theme.spacing(1)};
`
);

export const SliderDisplay = ({
  min,
  max,
  value,
  captionLeft,
  captionRight,
  marks,
  sx,
}: SliderDisplayProps) => {
  const theme = useTheme();
  return (
    <TradeSummaryBox sx={{ ...sx, paddingBottom: '4px' }}>
      <CaptionContainer>
        {captionLeft && (
          <Box>
            <Label inline msg={captionLeft.title} />
            <LabelValue inline marginLeft={theme.spacing(1)}>
              {captionLeft.value}
            </LabelValue>
          </Box>
        )}
        {captionRight && (
          <Box>
            <Label inline msg={captionRight.title} />
            <LabelValue inline marginLeft={theme.spacing(1)}>
              {captionRight.value}
            </LabelValue>
          </Box>
        )}
      </CaptionContainer>
      <SliderContainer>
        <SliderBasic
          min={min}
          max={max}
          step={0.01}
          value={value}
          disabled={true}
          marks={marks}
        />
      </SliderContainer>
    </TradeSummaryBox>
  );
};
