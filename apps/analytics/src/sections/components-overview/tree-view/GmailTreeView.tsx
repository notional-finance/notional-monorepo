'use client';

import { ReactNode } from 'react';

// material-ui
import { styled } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { TreeView } from '@mui/x-tree-view/TreeView';
import { TreeItem, TreeItemProps, treeItemClasses } from '@mui/x-tree-view/TreeItem';

// project import
import MainCard from 'components/MainCard';

// assets
import MailFilled from '@ant-design/icons/MailFilled';
import DeleteFilled from '@ant-design/icons/DeleteFilled';
import TagFilled from '@ant-design/icons/TagFilled';
import ProfileFilled from '@ant-design/icons/ProfileFilled';
import InfoCircleFilled from '@ant-design/icons/InfoCircleFilled';
import SnippetsFilled from '@ant-design/icons/SnippetsFilled';
import TagsFilled from '@ant-design/icons/TagsFilled';
import CaretDownFilled from '@ant-design/icons/CaretDownFilled';
import CaretRightFilled from '@ant-design/icons/CaretRightFilled';

declare module 'react' {
  interface CSSProperties {
    '--tree-view-color'?: string;
    '--tree-view-bg-color'?: string;
  }
}

type StyledTreeItemProps = TreeItemProps & {
  bgColor?: string;
  color?: string;
  labelIcon: ReactNode;
  labelInfo?: string;
  labelText: string;
};

const StyledTreeItemRoot = styled(TreeItem)(({ theme }) => ({
  color: theme.palette.text.secondary,
  [`& .${treeItemClasses.content}`]: {
    color: theme.palette.text.secondary,
    borderTopRightRadius: theme.spacing(2),
    borderBottomRightRadius: theme.spacing(2),
    paddingRight: theme.spacing(1),
    fontWeight: theme.typography.fontWeightMedium,
    '&.Mui-expanded': {
      fontWeight: theme.typography.fontWeightRegular
    },
    '&:hover': {
      background: theme.palette.action.hover
    },
    '&.Mui-focused, &.Mui-selected, &.Mui-selected.Mui-focused': {
      background: `var(--tree-view-bg-color, ${theme.palette.action.selected})`,
      color: 'var(--tree-view-color)'
    },
    [`& .${treeItemClasses.label}`]: {
      fontWeight: 'inherit',
      color: 'inherit'
    }
  },
  [`& .${treeItemClasses.group}`]: {
    marginLeft: 0,
    [`& .${treeItemClasses.content}`]: {
      paddingLeft: theme.spacing(2)
    }
  }
}));

function StyledTreeItem({ bgColor, color, labelIcon, labelInfo, labelText, ...other }: StyledTreeItemProps) {
  return (
    <StyledTreeItemRoot
      label={
        <Box sx={{ display: 'flex', alignItems: 'center', p: 0.5, pr: 0 }}>
          <Box sx={{ mr: 1, fontSize: '1rem' }}>{labelIcon}</Box>
          <Typography variant="body2" sx={{ fontWeight: 'inherit', flexGrow: 1 }}>
            {labelText}
          </Typography>
          <Typography variant="caption" color="inherit">
            {labelInfo}
          </Typography>
        </Box>
      }
      style={{ '--tree-view-color': color, '--tree-view-bg-color': bgColor }}
      {...other}
    />
  );
}

// ==============================|| TREE VIEW - GMAIL ||============================== //

export default function GmailTreeView() {
  return (
    <MainCard title="Gmail Clone">
      <TreeView
        aria-label="gmail"
        defaultExpanded={['3']}
        defaultCollapseIcon={<CaretDownFilled />}
        defaultExpandIcon={<CaretRightFilled />}
        defaultEndIcon={<div style={{ width: 24 }} />}
        sx={{ height: 400, flexGrow: 1, overflowY: 'auto' }}
      >
        <StyledTreeItem nodeId="1" labelText="All Mail" labelIcon={<MailFilled />} />
        <StyledTreeItem nodeId="2" labelText="Trash" labelIcon={<DeleteFilled />} />
        <StyledTreeItem nodeId="3" labelText="Categories" labelIcon={<TagFilled />}>
          <StyledTreeItem nodeId="5" labelText="Social" labelIcon={<ProfileFilled />} labelInfo="90" color="#1a73e8" bgColor="#e8f0fe" />
          <StyledTreeItem
            nodeId="6"
            labelText="Updates"
            labelIcon={<InfoCircleFilled />}
            labelInfo="2,294"
            color="#e3742f"
            bgColor="#fcefe3"
          />
          <StyledTreeItem
            nodeId="7"
            labelText="Forums"
            labelIcon={<SnippetsFilled />}
            labelInfo="3,566"
            color="#a250f5"
            bgColor="#f3e8fd"
          />
          <StyledTreeItem nodeId="8" labelText="Promotions" labelIcon={<TagsFilled />} labelInfo="733" color="#3c8039" bgColor="#e6f4ea" />
        </StyledTreeItem>
        <StyledTreeItem nodeId="4" labelText="History" labelIcon={<TagFilled />} />
      </TreeView>
    </MainCard>
  );
}
