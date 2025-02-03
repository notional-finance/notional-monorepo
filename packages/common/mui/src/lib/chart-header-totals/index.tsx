import { useAppStore } from '@notional-finance/notionable-hooks';
import ChartHeaderTotalsMobile, {
  ChartHeaderTotalsProps as ChartHeaderTotalsPropsMobile,
  ChartHeaderTotalsDataProps as ChartHeaderTotalsDataPropsMobile,
} from './chart-header-totals-mobile';
import ChartHeaderTotalsDesktop, {
  ChartHeaderTotalsProps as ChartHeaderTotalsPropsDesktop,
  ChartHeaderTotalsDataProps as ChartHeaderTotalsDataPropsDesktop,
} from './chart-header-totals';

export type ChartHeaderTotalsProps =
  | ChartHeaderTotalsPropsDesktop
  | ChartHeaderTotalsPropsMobile;

export type ChartHeaderTotalsDataProps =
  | ChartHeaderTotalsDataPropsDesktop
  | ChartHeaderTotalsDataPropsMobile;

const ChartHeaderTotals = (props: ChartHeaderTotalsProps) => {
  const { isMobileView } = useAppStore();
  return isMobileView ? (
    <ChartHeaderTotalsMobile {...props} />
  ) : (
    <ChartHeaderTotalsDesktop {...props} />
  );
};

export default ChartHeaderTotals;
