'use client';

// material-ui
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem } from '@mui/x-tree-view/TreeItem';

// project import
import MainCard from 'components/MainCard';

// assets
import DownOutlined from '@ant-design/icons/DownOutlined';
import RightOutlined from '@ant-design/icons/RightOutlined';

// ==============================|| TREE VIEW - BASIC ||============================== //

export default function BasicTreeView() {
  return (
    <MainCard title="Basic">
      <TreeView
        aria-label="file system navigator"
        defaultCollapseIcon={<DownOutlined />}
        defaultExpandIcon={<RightOutlined />}
        defaultExpanded={['5']}
        sx={{ height: 240, flexGrow: 1, maxWidth: 400, overflowY: 'auto' }}
      >
        <TreeItem nodeId="1" label="Applications">
          <TreeItem nodeId="2" label="Calendar" />
        </TreeItem>
        <TreeItem nodeId="5" label="Documents">
          <TreeItem nodeId="10" label="OSS" />
          <TreeItem nodeId="6" label="MUI">
            <TreeItem nodeId="8" label="index.js" />
          </TreeItem>
        </TreeItem>
      </TreeView>
    </MainCard>
  );
}
