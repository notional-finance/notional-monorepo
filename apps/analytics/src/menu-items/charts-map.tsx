// third-party
import { FormattedMessage } from 'react-intl';

// assets
import PieChartOutlined from '@ant-design/icons/PieChartOutlined';
import EnvironmentOutlined from '@ant-design/icons/EnvironmentOutlined';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = { PieChartOutlined, EnvironmentOutlined };

// ==============================|| MENU ITEMS - FORMS & TABLES ||============================== //

const chartsMap: NavItemType = {
  id: 'group-charts-map',
  title: <FormattedMessage id="charts-map" />,
  icon: icons.PieChartOutlined,
  type: 'group',
  children: [
    {
      id: 'react-chart',
      title: <FormattedMessage id="charts" />,
      type: 'collapse',
      icon: icons.PieChartOutlined,
      children: [
        {
          id: 'apexchart',
          title: <FormattedMessage id="apexchart" />,
          type: 'item',
          url: '/charts/apexchart'
        },
        {
          id: 'org-chart',
          title: <FormattedMessage id="org-chart" />,
          type: 'item',
          url: '/charts/org-chart'
        }
      ]
    },
    {
      id: 'map',
      title: <FormattedMessage id="map" />,
      type: 'item',
      url: '/map',
      icon: icons.EnvironmentOutlined
    }
  ]
};

export default chartsMap;
