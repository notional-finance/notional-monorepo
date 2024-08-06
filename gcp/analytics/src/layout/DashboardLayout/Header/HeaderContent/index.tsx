'use client';

import React, { useEffect } from 'react';

import DownOutlined from '@ant-design/icons/DownOutlined';

// next
import NextLink from 'next/link';

// material-ui
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Popover from '@mui/material/Popover';

// project import
import Logo from 'components/logo';
import AnimateButton from 'components/@extended/AnimateButton';
import { useParams } from 'next/navigation';

// ==============================|| COMPONENTS - APP BAR ||============================== //

export default function Header() {
  const theme = useTheme();
  const { token } = useParams();
  const [pathname, setPathname] = React.useState<string>('');
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);
  const downMD = useMediaQuery(theme.breakpoints.down('md'));
  const handleClick = (event: any) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  useEffect(() => {
    if (window.location.pathname !== pathname) {
      setPathname(window.location.pathname);
    }
  }, [pathname, setPathname]);

  const availableTokens = ['ETH', 'DAI', 'USDC', 'GHO'];

  return (
    <>
      <AppBar sx={{ bgcolor: 'white', boxShadow: 'none' }}>
        <Container disableGutters={downMD} sx={{ maxWidth: '1440px !important' }}>
          <Toolbar sx={{ px: { xs: 1.5, md: 0, lg: 0 }, py: 2 }}>
            <Stack direction="row" sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} alignItems="center" spacing={2}>
              <Typography sx={{ textAlign: 'left', display: 'inline-block' }}>
                <Logo reverse to="/" sx={{ marginRight: '72px' }} />
              </Typography>
              <NextLink href={'/'} passHref legacyBehavior>
                <Link
                  className="header-link"
                  color="black"
                  underline="none"
                  sx={{
                    cursor: 'pointer',
                    color: pathname === '/' ? theme.palette.primary.main : 'black'
                  }}
                >
                  Overview
                </Link>
              </NextLink>
              <Link
                className="header-link"
                color="black"
                underline="none"
                onClick={handleClick}
                sx={{ cursor: 'pointer', color: pathname.includes('markets') ? theme.palette.primary.main : 'black' }}
              >
                Markets
                <DownOutlined
                  color={pathname.includes('markets') ? theme.palette.primary.main : 'black'}
                  style={{ marginLeft: '8px', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease-in-out' }}
                />
              </Link>
              <NextLink href="/transactions" passHref legacyBehavior>
                <Link
                  className="header-link"
                  color="black"
                  underline="none"
                  sx={{ cursor: 'pointer', color: pathname.includes('transactions') ? theme.palette.primary.main : 'black' }}
                >
                  Transactions
                </Link>
              </NextLink>
              <NextLink href="/accounts" passHref legacyBehavior>
                <Link
                  className="header-link"
                  color="black"
                  underline="none"
                  sx={{ cursor: 'pointer', color: pathname.includes('accounts') ? theme.palette.primary.main : 'black' }}
                >
                  Accounts
                </Link>
              </NextLink>
            </Stack>
            <Stack
              direction="row"
              sx={{
                '& .header-link': { px: 1, '&:hover': { color: 'primary.main' } },
                display: { xs: 'none', md: 'block' }
              }}
              spacing={2}
            >
              <Box sx={{ display: 'inline-block' }}>
                <AnimateButton>
                  <Button
                    component={Link}
                    href="https://mui.com/store/items/mantis-react-admin-dashboard-template/"
                    disableElevation
                    color="primary"
                    variant="contained"
                    sx={{
                      background: theme.palette.primary.main
                    }}
                  >
                    Launch App
                  </Button>
                </AnimateButton>
              </Box>
            </Stack>
            <Box sx={{ width: '100%', alignItems: 'center', justifyContent: 'space-between', display: { xs: 'flex', md: 'none' } }}>
              <Typography sx={{ textAlign: 'left', display: 'inline-block' }}>
                <Logo reverse to="/" />
              </Typography>
            </Box>
          </Toolbar>
          {pathname.includes('markets') && (
            <Toolbar sx={{ px: { xs: 1.5, md: 0, lg: 0 }, py: 2, borderTop: '1px solid #e6ebf1' }}>
              <Stack direction="row" sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} alignItems="center" spacing={2}>
                <NextLink href={`/markets/${token}/overview`} passHref legacyBehavior>
                  <Link
                    className="header-link"
                    color="black"
                    underline="none"
                    sx={{
                      cursor: 'pointer',
                      color: pathname.includes(`/markets/${token}/overview`) ? theme.palette.primary.main : 'black',
                      fontWeight: 500
                    }}
                  >
                    Market Overview
                  </Link>
                </NextLink>
                <NextLink href={`/markets/${token}/breakdowns`} passHref legacyBehavior>
                  <Link
                    className="header-link"
                    color="black"
                    underline="none"
                    sx={{
                      cursor: 'pointer',
                      color: pathname.includes(`/markets/${token}/breakdowns`) ? theme.palette.primary.main : 'black',
                      fontWeight: 500
                    }}
                  >
                    Breakdowns
                  </Link>
                </NextLink>
                <NextLink href={`/markets/${token}/transaction-history`} passHref legacyBehavior>
                  <Link
                    className="header-link"
                    color="black"
                    underline="none"
                    sx={{
                      cursor: 'pointer',
                      color: pathname.includes(`/markets/${token}/transaction-history`) ? theme.palette.primary.main : 'black',
                      fontWeight: 500
                    }}
                  >
                    Transaction History
                  </Link>
                </NextLink>
                <NextLink href={`/markets/${token}/parameters`} passHref legacyBehavior>
                  <Link
                    className="header-link"
                    color="black"
                    underline="none"
                    sx={{
                      cursor: 'pointer',
                      color: pathname.includes(`/markets/${token}/parameters`) ? theme.palette.primary.main : 'black',
                      fontWeight: 500
                    }}
                  >
                    Parameters
                  </Link>
                </NextLink>
                <NextLink href={`/markets/${token}/historical-market-data`} passHref legacyBehavior>
                  <Link
                    className="header-link"
                    color="black"
                    underline="none"
                    sx={{
                      cursor: 'pointer',
                      color: pathname.includes(`/markets/${token}/historical-market-data`) ? theme.palette.primary.main : 'black',
                      fontWeight: 500
                    }}
                  >
                    Historical Market Data
                  </Link>
                </NextLink>
              </Stack>
            </Toolbar>
          )}
        </Container>
      </AppBar>
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left'
        }}
        sx={{
          marginLeft: '-180px'
        }}
      >
        <Box
          sx={{
            width: '767px',
            height: '269px',
            color: 'black',
            background: 'white',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          {availableTokens.map((token, i) => (
            <NextLink href={`/markets/${token}/overview`} passHref legacyBehavior key={i}>
              <Link className="header-link" color="black" underline="none" sx={{ cursor: 'pointer' }}>
                {token}
              </Link>
            </NextLink>
          ))}
        </Box>
      </Popover>
    </>
  );
}
