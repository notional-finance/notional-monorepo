import { useEffect, useState, ReactElement } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project imports
import ItemComment from './ItemComment';
import EditItem from './EditItem';
import AddItemComment from './AddItemComment';
import AlertItemDelete from './AlertItemDelete';
import SimpleBar from 'components/third-party/SimpleBar';
import IconButton from 'components/@extended/IconButton';

import { deleteItem, handlerKanbanDialog, useGetBacklogs, useGetKanbanMaster } from 'api/kanban';
import { openSnackbar } from 'api/snackbar';

// assets
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import DeleteFilled from '@ant-design/icons/DeleteFilled';

// types
import { SnackbarProps } from 'types/snackbar';
import { KanbanComment, KanbanItem, KanbanProfile } from 'types/kanban';

// ==============================|| KANBAN BOARD - ITEM DETAILS ||============================== //

export default function ItemDetails() {
  let selectedData: KanbanItem;
  let commentList: ReactElement | ReactElement[] = <></>;

  const { backlogs } = useGetBacklogs();
  const { kanbanMaster } = useGetKanbanMaster();

  const selectedItem = kanbanMaster?.selectedItem ? kanbanMaster.selectedItem : false;

  // drawer
  const [open, setOpen] = useState<boolean>(selectedItem !== false);
  const handleDrawerOpen = () => {
    setOpen((prevState) => !prevState);
    handlerKanbanDialog(false);
  };

  useEffect(() => {
    selectedItem !== false && setOpen(true);
  }, [selectedItem]);

  if (selectedItem !== false) {
    selectedData = backlogs?.items.filter((item: KanbanItem) => item.id === selectedItem)[0];
    if (selectedData?.commentIds) {
      commentList = [...selectedData.commentIds].reverse().map((commentId, index) => {
        const commentData = backlogs?.comments.filter((comment: KanbanComment) => comment.id === commentId)[0];
        const profile = backlogs?.profiles.filter((item: KanbanProfile) => item.id === commentData.profileId)[0];
        return <ItemComment key={index} comment={commentData} profile={profile} />;
      });
    }
  }

  const [openModal, setOpenModal] = useState(false);

  const handleModalClose = (status: boolean) => {
    setOpenModal(false);
    if (status) {
      handleDrawerOpen();
      deleteItem(selectedData.id);
      openSnackbar({
        open: true,
        message: 'Task Deleted successfully',
        anchorOrigin: { vertical: 'top', horizontal: 'right' },
        variant: 'alert',
        alert: {
          color: 'success'
        }
      } as SnackbarProps);
    }
  };

  return (
    <Drawer
      sx={{
        ml: open ? 3 : 0,
        flexShrink: 0,
        zIndex: 1200,
        overflowX: 'hidden',
        width: { xs: 320, md: 450 },
        '& .MuiDrawer-paper': {
          width: { xs: 320, md: 450 },
          border: 'none',
          borderRadius: '0px'
        }
      }}
      variant="temporary"
      anchor="right"
      open={open}
      ModalProps={{ keepMounted: true }}
      onClose={handleDrawerOpen}
    >
      {open && (
        <SimpleBar
          sx={{
            overflowX: 'hidden',
            height: '100vh'
          }}
        >
          {selectedData! && (
            <>
              <Box sx={{ p: 3 }}>
                <Grid container alignItems="center" spacing={0.5} justifyContent="space-between">
                  <Grid item sx={{ width: 'calc(100% - 64px)' }}>
                    <Stack direction="row" spacing={0.5} alignItems="center" justifyContent="space-between">
                      <Typography
                        variant="h4"
                        sx={{
                          display: 'inline-block',
                          width: 'calc(100% - 34px)',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          verticalAlign: 'middle'
                        }}
                      >
                        {selectedData.title}
                      </Typography>
                    </Stack>
                  </Grid>

                  <Grid item>
                    <Stack direction="row" alignItems="center">
                      <Tooltip title="Delete Task">
                        <IconButton color="error" onClick={() => setOpenModal(true)} size="small" sx={{ fontSize: '0.875rem' }}>
                          <DeleteFilled />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Close">
                        <IconButton color="secondary" onClick={handleDrawerOpen} size="small" sx={{ fontSize: '0.875rem' }}>
                          <CloseOutlined />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                    <AlertItemDelete title={selectedData.title} open={openModal} handleClose={handleModalClose} />
                  </Grid>
                </Grid>
              </Box>
              <Divider />
              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <EditItem
                      item={selectedData}
                      profiles={backlogs?.profiles}
                      userStory={backlogs?.userStory}
                      columns={backlogs?.columns}
                      handleDrawerOpen={handleDrawerOpen}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    {commentList}
                  </Grid>
                  <Grid item xs={12}>
                    <AddItemComment itemId={selectedItem} />
                  </Grid>
                </Grid>
              </Box>
            </>
          )}
          {!selectedData! && (
            <Stack justifyContent="center" alignItems="center" sx={{ height: '100vh' }}>
              <Typography variant="h5" color="error">
                No item found
              </Typography>
            </Stack>
          )}
        </SimpleBar>
      )}
    </Drawer>
  );
}
