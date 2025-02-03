import { useAppStore } from '@notional-finance/notionable-hooks';
import MultiDisplayChartDesktop, {
  ChartComponentsProps as ChartComponentsPropsDesktop,
  MultiDisplayChartProps as MultiDisplayChartPropsDesktop,
} from './multi-display-chart';
import MultiDisplayChartMobile, {
  ChartComponentsProps as ChartComponentsPropsMobile,
  MultiDisplayChartProps as MultiDisplayChartPropsMobile,
} from './multi-display-chart-mobile';

export type ChartComponentsProps =
  | ChartComponentsPropsDesktop
  | ChartComponentsPropsMobile;

export type MultiDisplayChartProps =
  | MultiDisplayChartPropsDesktop
  | MultiDisplayChartPropsMobile;

const MultiDisplayChart = (props: MultiDisplayChartProps) => {
  const { isMobileView } = useAppStore();
  return isMobileView ? (
    <MultiDisplayChartMobile {...props} />
  ) : (
    <MultiDisplayChartDesktop {...props} />
  );
};

export default MultiDisplayChart;
