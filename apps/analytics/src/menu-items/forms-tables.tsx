// third-party
import { FormattedMessage } from 'react-intl';

// assets
import CloudUploadOutlined from '@ant-design/icons/CloudUploadOutlined';
import FileDoneOutlined from '@ant-design/icons/FileDoneOutlined';
import FormOutlined from '@ant-design/icons/FormOutlined';
import PieChartOutlined from '@ant-design/icons/PieChartOutlined';
import StepForwardOutlined from '@ant-design/icons/StepForwardOutlined';
import TableOutlined from '@ant-design/icons/TableOutlined';
import InsertRowAboveOutlined from '@ant-design/icons/InsertRowAboveOutlined';

// type
import { NavItemType } from 'types/menu';

// icons
const icons = {
  CloudUploadOutlined,
  FileDoneOutlined,
  FormOutlined,
  PieChartOutlined,
  StepForwardOutlined,
  TableOutlined,
  InsertRowAboveOutlined
};

// ==============================|| MENU ITEMS - FORMS & TABLES ||============================== //

const formsTables: NavItemType = {
  id: 'group-forms-tables',
  title: <FormattedMessage id="forms-tables" />,
  icon: icons.FileDoneOutlined,
  type: 'group',
  children: [
    {
      id: 'validation',
      title: <FormattedMessage id="forms-validation" />,
      type: 'item',
      url: '/forms/validation',
      icon: icons.FileDoneOutlined
    },
    {
      id: 'wizard',
      title: <FormattedMessage id="forms-wizard" />,
      type: 'item',
      url: '/forms/wizard',
      icon: icons.StepForwardOutlined
    },
    {
      id: 'forms-layout',
      title: <FormattedMessage id="layout" />,
      type: 'collapse',
      icon: icons.FormOutlined,
      children: [
        {
          id: 'basic',
          title: <FormattedMessage id="basic" />,
          type: 'item',
          url: '/forms/layouts/basic'
        },
        {
          id: 'multi-column',
          title: <FormattedMessage id="multi-column" />,
          type: 'item',
          url: '/forms/layouts/multi-column'
        },
        {
          id: 'action-bar',
          title: <FormattedMessage id="action-bar" />,
          type: 'item',
          url: '/forms/layouts/action-bar'
        },
        {
          id: 'sticky-bar',
          title: <FormattedMessage id="sticky-bar" />,
          type: 'item',
          url: '/forms/layouts/sticky-bar'
        }
      ]
    },
    {
      id: 'forms-plugins',
      title: <FormattedMessage id="plugins" />,
      type: 'collapse',
      icon: icons.CloudUploadOutlined,
      children: [
        {
          id: 'mask',
          title: <FormattedMessage id="mask" />,
          type: 'item',
          url: '/forms/plugins/mask'
        },
        {
          id: 'clipboard',
          title: <FormattedMessage id="clipboard" />,
          type: 'item',
          url: '/forms/plugins/clipboard'
        },
        {
          id: 're-captcha',
          title: <FormattedMessage id="re-captcha" />,
          type: 'item',
          url: '/forms/plugins/re-captcha'
        },
        {
          id: 'editor',
          title: <FormattedMessage id="editor" />,
          type: 'item',
          url: '/forms/plugins/editor'
        },
        {
          id: 'dropzone',
          title: <FormattedMessage id="dropzone" />,
          type: 'item',
          url: '/forms/plugins/dropzone'
        }
      ]
    },
    {
      id: 'react-tables',
      title: <FormattedMessage id="react-table" />,
      type: 'collapse',
      icon: icons.InsertRowAboveOutlined,
      children: [
        {
          id: 'rt-table',
          title: <FormattedMessage id="basic" />,
          type: 'item',
          url: '/tables/react-table/basic'
        },
        {
          id: 'rt-dense',
          title: <FormattedMessage id="dense" />,
          type: 'item',
          url: '/tables/react-table/dense'
        },
        {
          id: 'rt-sorting',
          title: <FormattedMessage id="sorting" />,
          type: 'item',
          url: '/tables/react-table/sorting'
        },
        {
          id: 'rt-filtering',
          title: <FormattedMessage id="filtering" />,
          type: 'item',
          url: '/tables/react-table/filtering'
        },
        {
          id: 'rt-grouping',
          title: <FormattedMessage id="grouping" />,
          type: 'item',
          url: '/tables/react-table/grouping'
        },
        {
          id: 'rt-pagination',
          title: <FormattedMessage id="pagination" />,
          type: 'item',
          url: '/tables/react-table/pagination'
        },
        {
          id: 'rt-row-selection',
          title: <FormattedMessage id="row-selection" />,
          type: 'item',
          url: '/tables/react-table/row-selection'
        },
        {
          id: 'rt-expanding',
          title: <FormattedMessage id="expanding" />,
          type: 'item',
          url: '/tables/react-table/expanding'
        },
        {
          id: 'rt-editable',
          title: <FormattedMessage id="editable" />,
          type: 'item',
          url: '/tables/react-table/editable'
        },
        {
          id: 'rt-drag-drop',
          title: <FormattedMessage id="drag-drop" />,
          type: 'item',
          url: '/tables/react-table/drag-drop'
        },
        {
          id: 'rt-column-visibility',
          title: <FormattedMessage id="column-visibility" />,
          type: 'item',
          url: '/tables/react-table/column-visibility'
        },
        {
          id: 'rt-column-resizing',
          title: <FormattedMessage id="column-resizing" />,
          type: 'item',
          url: '/tables/react-table/column-resizing'
        },
        {
          id: 'rt-sticky-table',
          title: <FormattedMessage id="sticky" />,
          type: 'item',
          url: '/tables/react-table/sticky-table'
        },
        {
          id: 'rt-umbrella',
          title: <FormattedMessage id="umbrella" />,
          type: 'item',
          url: '/tables/react-table/umbrella'
        },
        {
          id: 'rt-empty',
          title: <FormattedMessage id="empty" />,
          type: 'item',
          url: '/tables/react-table/empty'
        },
        {
          id: 'rt-virtualized',
          title: <FormattedMessage id="virtualized" />,
          type: 'item',
          url: '/tables/react-table/virtualized'
        }
      ]
    },
    {
      id: 'mui-tables',
      title: <FormattedMessage id="mui-table" />,
      type: 'collapse',
      icon: icons.TableOutlined,
      children: [
        {
          id: 'mui-table',
          title: <FormattedMessage id="basic" />,
          type: 'item',
          url: '/tables/mui-table/basic'
        },
        {
          id: 'mui-dense',
          title: <FormattedMessage id="dense" />,
          type: 'item',
          url: '/tables/mui-table/dense'
        },
        {
          id: 'mui-enhanced',
          title: <FormattedMessage id="enhanced" />,
          type: 'item',
          url: '/tables/mui-table/enhanced'
        },
        {
          id: 'mui-data-table',
          title: <FormattedMessage id="datatable" />,
          type: 'item',
          url: '/tables/mui-table/datatable'
        },
        {
          id: 'mui-custom',
          title: <FormattedMessage id="custom" />,
          type: 'item',
          url: '/tables/mui-table/custom'
        },
        {
          id: 'mui-fixed-header',
          title: <FormattedMessage id="fixed-header" />,
          type: 'item',
          url: '/tables/mui-table/fixed-header'
        },
        {
          id: 'mui-collapse',
          title: <FormattedMessage id="collapse" />,
          type: 'item',
          url: '/tables/mui-table/collapse'
        }
      ]
    }
  ]
};

export default formsTables;
