import { useAppStore } from '@notional-finance/notionable-hooks';
import { observer } from 'mobx-react-lite';
import PortfolioRiskMobile from './portfolio-risk-mobile';
import PortfolioRiskDesktop from './portfolio-risk-desktop';

const PortfolioRisk = () => {
  const { isMobileView } = useAppStore();

  return isMobileView ? <PortfolioRiskMobile /> : <PortfolioRiskDesktop />;
};

export default observer(PortfolioRisk);
