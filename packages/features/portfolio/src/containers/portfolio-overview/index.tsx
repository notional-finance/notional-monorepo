import { useAppStore } from '@notional-finance/notionable-hooks';
import PortfolioOverview from './portfolio-overview';
import PortfolioOverviewMobile from './portfolio-overview-mobile';

const PortfolioOverviewContainer = () => {
  const { isMobileView } = useAppStore();

  return isMobileView ? <PortfolioOverviewMobile /> : <PortfolioOverview />;
};

export default PortfolioOverviewContainer;
