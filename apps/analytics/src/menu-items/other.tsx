// third-party
import { FormattedMessage } from 'react-intl';

// assets
import BorderOutlined from '@ant-design/icons/BorderOutlined';
import BoxPlotOutlined from '@ant-design/icons/BoxPlotOutlined';
import DeploymentUnitOutlined from '@ant-design/icons/DeploymentUnitOutlined';
import GatewayOutlined from '@ant-design/icons/GatewayOutlined';
import MenuUnfoldOutlined from '@ant-design/icons/MenuUnfoldOutlined';
import QuestionOutlined from '@ant-design/icons/QuestionOutlined';
import SmileOutlined from '@ant-design/icons/SmileOutlined';
import StopOutlined from '@ant-design/icons/StopOutlined';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  BorderOutlined,
  BoxPlotOutlined,
  DeploymentUnitOutlined,
  GatewayOutlined,
  MenuUnfoldOutlined,
  QuestionOutlined,
  StopOutlined,
  SmileOutlined
};

// ==============================|| MENU ITEMS - SUPPORT ||============================== //

const other: NavItemType = {
  id: 'other',
  type: 'group',
  children: [
    {
      id: 'menu-level',
      title: <FormattedMessage id="menu-level" />,
      type: 'collapse',
      icon: icons.MenuUnfoldOutlined,
      children: [
        {
          id: 'menu-level-1.1',
          title: (
            <>
              <FormattedMessage id="level" /> 1
            </>
          ),
          type: 'item',
          url: '#'
        },
        {
          id: 'menu-level-1.2',
          title: (
            <>
              <FormattedMessage id="level" /> 1
            </>
          ),
          type: 'collapse',
          children: [
            {
              id: 'menu-level-2.1',
              title: (
                <>
                  <FormattedMessage id="level" /> 2
                </>
              ),
              type: 'item',
              url: '#'
            },
            {
              id: 'menu-level-2.2',
              title: (
                <>
                  <FormattedMessage id="level" /> 2
                </>
              ),
              type: 'collapse',
              children: [
                {
                  id: 'menu-level-3.1',
                  title: (
                    <>
                      <FormattedMessage id="level" /> 3
                    </>
                  ),
                  type: 'item',
                  url: '#'
                },
                {
                  id: 'menu-level-3.2',
                  title: (
                    <>
                      <FormattedMessage id="level" /> 3
                    </>
                  ),
                  type: 'item',
                  url: '#'
                }
              ]
            }
          ]
        }
      ]
    },
    {
      id: 'menu-level-subtitle',
      title: <FormattedMessage id="menu-level-subtitle" />,
      caption: <FormattedMessage id="menu-level-subtitle-caption" />,
      type: 'collapse',
      icon: icons.BoxPlotOutlined,
      children: [
        {
          id: 'sub-menu-level-1.1',
          title: (
            <>
              <FormattedMessage id="level" /> 1
            </>
          ),
          caption: <FormattedMessage id="menu-level-subtitle-item" />,
          type: 'item',
          url: '#'
        },
        {
          id: 'sub-menu-level-1.2',
          title: (
            <>
              <FormattedMessage id="level" /> 1
            </>
          ),
          caption: <FormattedMessage id="menu-level-subtitle-collapse" />,
          type: 'collapse',
          children: [
            {
              id: 'sub-menu-level-2.1',
              title: (
                <>
                  <FormattedMessage id="level" /> 2
                </>
              ),
              caption: <FormattedMessage id="menu-level-subtitle-sub-item" />,
              type: 'item',
              url: '#'
            }
          ]
        }
      ]
    },
    {
      id: 'disabled-menu',
      title: <FormattedMessage id="disabled-menu" />,
      type: 'item',
      url: '#',
      icon: icons.StopOutlined,
      disabled: true
    },
    {
      id: 'oval-chip-menu',
      title: <FormattedMessage id="oval-chip-menu" />,
      type: 'item',
      url: '#',
      icon: icons.BorderOutlined
    },
    {
      id: 'documentation',
      title: <FormattedMessage id="documentation" />,
      type: 'item',
      url: 'https://codedthemes.gitbook.io/mantis/',
      icon: icons.QuestionOutlined,
      external: true,
      target: true,
      chip: {
        label: 'gitbook',
        color: 'secondary',
        size: 'small'
      }
    },
    {
      id: 'roadmap',
      title: <FormattedMessage id="roadmap" />,
      type: 'item',
      url: 'https://codedthemes.gitbook.io/mantis/roadmap',
      icon: icons.DeploymentUnitOutlined,
      external: true,
      target: true
    }
  ]
};

export default other;
