'use client';
import { useState } from 'react';

// material-ui
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Fab from '@mui/material/Fab';
import Fade from '@mui/material/Fade';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import Tooltip, { tooltipClasses, TooltipProps } from '@mui/material/Tooltip';

// project import
import MainCard from 'components/MainCard';
import IconButton from 'components/@extended/IconButton';
import CustomTooltip from 'components/@extended/Tooltip';
import ComponentHeader from 'components/cards/ComponentHeader';
import ComponentWrapper from 'sections/components-overview/ComponentWrapper';

// assets
import DeleteFilled from '@ant-design/icons/DeleteFilled';
import PlusOutlined from '@ant-design/icons/PlusOutlined';

// tooltip
const LightTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(
  ({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      background: theme.palette.common.white,
      color: 'rgba(0, 0, 0, 0.87)',
      boxShadow: theme.shadows[1],
      fontSize: 11
    }
  })
);
LightTooltip.displayName = 'LightTooltip';

const BootstrapTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(
  ({ theme }) => ({
    [`& .${tooltipClasses.arrow}`]: {
      color: theme.palette.secondary.dark
    },
    [`& .${tooltipClasses.tooltip}`]: {
      background: theme.palette.secondary.dark
    }
  })
);
BootstrapTooltip.displayName = 'BootstrapTooltip';

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)(
  ({ theme }) => ({
    [`& .${tooltipClasses.tooltip}`]: {
      background: '#f5f5f9',
      color: 'rgba(0, 0, 0, 0.87)',
      maxWidth: 220,
      fontSize: theme.typography.pxToRem(12),
      border: '1px solid #dadde9'
    }
  })
);
HtmlTooltip.displayName = 'HtmlTooltip';

const CustomWidthTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 500
  }
});
CustomWidthTooltip.displayName = 'CustomWidthTooltip';

const NoMaxWidthTooltip = styled(({ className, ...props }: TooltipProps) => <Tooltip {...props} classes={{ popper: className }} />)({
  [`& .${tooltipClasses.tooltip}`]: {
    maxWidth: 'none'
  }
});
NoMaxWidthTooltip.displayName = 'NoMaxWidthTooltip';

// ==============================|| COMPONENT - TOOLTIP ||============================== //

function ComponentTooltip() {
  const [open, setOpen] = useState(false);
  const handleTooltipClose = () => {
    setOpen(false);
  };

  const handleTooltipOpen = () => {
    setOpen(true);
  };

  const longText = `
Aliquam eget finibus ante, non facilisis lectus. Sed vitae dignissim est, vel aliquam tellus.
Praesent non nunc mollis, fermentum neque at, semper arcu.
Nullam eget est sed sem iaculis gravida eget vitae justo.`;

  return (
    <>
      <ComponentHeader
        title="Tooltip"
        caption="Tooltips display informative text when users hover over, focus on, or tap an element."
        directory="src/pages/components-overview/tooltip"
        link="https://mui.com/material-ui/react-tooltip/"
      />
      <ComponentWrapper>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <MainCard title="Simple Tooltips">
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="Delete">
                      <IconButton aria-label="delete" size="large">
                        <DeleteFilled />
                      </IconButton>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Add" aria-label="add">
                      <Fab color="primary" sx={{ m: 2 }}>
                        <PlusOutlined style={{ fontSize: '1.3rem' }} />
                      </Fab>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Triggers/Controlled Tooltips">
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip disableFocusListener title="Add">
                      <Button>Hover or touch</Button>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip disableFocusListener disableTouchListener title="Add">
                      <Button>Hover</Button>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <ClickAwayListener onClickAway={handleTooltipClose}>
                      <div>
                        <Tooltip
                          PopperProps={{
                            disablePortal: true
                          }}
                          onClose={handleTooltipClose}
                          open={open}
                          disableFocusListener
                          disableHoverListener
                          disableTouchListener
                          title="Add"
                        >
                          <Button onClick={handleTooltipOpen}>Click</Button>
                        </Tooltip>
                      </div>
                    </ClickAwayListener>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Customized Tooltip">
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <LightTooltip title="Add">
                      <Button>Light</Button>
                    </LightTooltip>
                  </Grid>
                  <Grid item>
                    <BootstrapTooltip title="Add">
                      <Button>Bootstrap</Button>
                    </BootstrapTooltip>
                  </Grid>
                  <Grid item>
                    <HtmlTooltip
                      title={
                        <>
                          <Typography color="inherit">Tooltip with HTML</Typography>
                          <em>And here&apos;s</em>{' '}
                          <Typography variant="subtitle1" component="span">
                            some
                          </Typography>{' '}
                          <u>amazing content</u>. it&apos;s very engaging. Right?
                        </>
                      }
                    >
                      <Button>HTML</Button>
                    </HtmlTooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Arrow Tooltips">
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="Add" arrow>
                      <Button>Arrow</Button>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Delay Tooltips">
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="Add" enterDelay={500} leaveDelay={200}>
                      <Button>[500ms, 200ms]</Button>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Disabled Tooltips">
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="You Don't have permission to do this">
                      <span>
                        <Button disabled>A Disabled Button</Button>
                      </span>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Disable Interactive Tooltips">
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="Add" disableInteractive>
                      <Button>Disable Interactive</Button>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>
          <Grid item xs={12} md={6}>
            <Stack spacing={3}>
              <MainCard title="Transitions Tooltips">
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title="Add">
                      <Button>Grow</Button>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip TransitionComponent={Fade} TransitionProps={{ timeout: 600 }} title="Add">
                      <Button>Fade</Button>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip TransitionComponent={Zoom} title="Add">
                      <Button>Zoom</Button>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Variable Width Tooltips">
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <Tooltip title={longText}>
                      <Button sx={{ m: 1 }}>Default Width [300px]</Button>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <CustomWidthTooltip title={longText}>
                      <Button sx={{ m: 1 }}>Custom Width [500px]</Button>
                    </CustomWidthTooltip>
                  </Grid>
                  <Grid item>
                    <NoMaxWidthTooltip title={longText}>
                      <Button sx={{ m: 1 }}>No wrapping</Button>
                    </NoMaxWidthTooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Positioned Tooltips">
                <Grid container justifyContent="center" spacing={1}>
                  <Grid item>
                    <Tooltip title="Add" placement="top-start">
                      <Button color="secondary" variant="outlined">
                        top-start
                      </Button>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Add" placement="top">
                      <Button color="secondary" variant="outlined">
                        top
                      </Button>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Add" placement="top-end">
                      <Button color="secondary" variant="outlined">
                        top-end
                      </Button>
                    </Tooltip>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" sx={{ my: 1 }}>
                  <Grid item xs={6} container alignItems="flex-start" direction="column" spacing={1}>
                    <Grid item>
                      <Tooltip title="Add" placement="right-start">
                        <Button color="secondary" variant="outlined">
                          right-start
                        </Button>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Add" placement="right">
                        <Button color="secondary" variant="outlined">
                          right
                        </Button>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Add" placement="right-end">
                        <Button color="secondary" variant="outlined">
                          right-end
                        </Button>
                      </Tooltip>
                    </Grid>
                  </Grid>
                  <Grid item xs={6} container alignItems="flex-end" direction="column" spacing={1}>
                    <Grid item>
                      <Tooltip title="Add" placement="left-start">
                        <Button color="secondary" variant="outlined">
                          left-start
                        </Button>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Add" placement="left">
                        <Button color="secondary" variant="outlined">
                          left
                        </Button>
                      </Tooltip>
                    </Grid>
                    <Grid item>
                      <Tooltip title="Add" placement="left-end">
                        <Button color="secondary" variant="outlined">
                          left-end
                        </Button>
                      </Tooltip>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid container justifyContent="center" spacing={1}>
                  <Grid item>
                    <Tooltip title="Add" placement="bottom-start">
                      <Button color="secondary" variant="outlined">
                        bottom-start
                      </Button>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Add" placement="bottom">
                      <Button color="secondary" variant="outlined">
                        bottom
                      </Button>
                    </Tooltip>
                  </Grid>
                  <Grid item>
                    <Tooltip title="Add" placement="bottom-end">
                      <Button color="secondary" variant="outlined">
                        bottom-end
                      </Button>
                    </Tooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Color Variant Tooltips">
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <CustomTooltip title="Add" color="primary">
                      <Button color="primary" variant="contained">
                        Primary
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid item>
                    <CustomTooltip title="Add" color="secondary">
                      <Button color="secondary" variant="contained">
                        Secondary
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid item>
                    <CustomTooltip title="Add" color="success">
                      <Button color="success" variant="contained">
                        Success
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid item>
                    <CustomTooltip title="Add" color="info">
                      <Button color="info" variant="contained">
                        Info
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid item>
                    <CustomTooltip title="Add" color="warning">
                      <Button color="warning" variant="contained">
                        Warning
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid item>
                    <CustomTooltip title="Add" color="error">
                      <Button color="error" variant="contained">
                        error
                      </Button>
                    </CustomTooltip>
                  </Grid>
                </Grid>
              </MainCard>
              <MainCard title="Custom Color Tooltips">
                <Grid container spacing={1} alignItems="center">
                  <Grid item>
                    <CustomTooltip title="Add" color="pink" labelColor="#000">
                      <Button color="inherit" variant="outlined">
                        pink
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid item>
                    <CustomTooltip title="Add" color="orange">
                      <Button color="inherit" variant="outlined">
                        Orange
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid item>
                    <CustomTooltip title="Add" color="yellow" labelColor="#000">
                      <Button color="inherit" variant="outlined">
                        Yellow
                      </Button>
                    </CustomTooltip>
                  </Grid>
                  <Grid item>
                    <CustomTooltip title="Add" color="#fff" labelColor="#000">
                      <Button color="inherit" variant="outlined">
                        Black/white
                      </Button>
                    </CustomTooltip>
                  </Grid>
                </Grid>
              </MainCard>
            </Stack>
          </Grid>
        </Grid>
      </ComponentWrapper>
    </>
  );
}

export default ComponentTooltip;
