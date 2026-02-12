import {
  alpha,
  Box,
  Button as MuiButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
} from '@mui/material';
import { colors } from '@notional-finance/styles';
import { ArrowIcon, TokenIcon, VaultStar } from '@notional-finance/icons';
import { Body, Dropdown, H1, H5, Toggle } from '@notional-finance/mui';
import { useState } from 'react';
import { defineMessage, FormattedMessage } from 'react-intl';

const TopBanner = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: theme.spacing(3),
        borderRadius: theme.shape.borderRadius(),
        background: 'linear-gradient(45deg, rgb(0, 68, 83), rgb(0, 43, 54))',
        padding: theme.spacing(2, 2, 2, 3),
        minHeight: theme.spacing(10),
        marginBottom: theme.spacing(5),
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: theme.spacing(6),
          height: theme.spacing(6),
          borderRadius: theme.shape.borderRadius(),
          backgroundColor: 'rgba(51, 248, 255, 0.5)',
          flexShrink: 0,
        }}
      >
        <VaultStar
          sx={{
            width: theme.spacing(4),
            height: theme.spacing(4),
          }}
        />
      </Box>
      <Box
        sx={{
          width: '100%',
          maxWidth: theme.spacing(74),
        }}
      >
        <H1
          gutter="none"
          sx={{
            color: colors.white,
            fontSize: '20px',
            fontWeight: 600,
            marginBottom: theme.spacing(0.5),
          }}
        >
          <FormattedMessage
            defaultMessage="High Yields. Maximum Transparency."
            description="Top banner title"
          />
        </H1>
        <Body
          component="p"
          gutter="none"
          sx={{
            color: colors.purpleGrey,
            fontSize: '14px',
            fontWeight: 400,
            margin: 0,
          }}
        >
          <FormattedMessage
            defaultMessage="Earn leveraged APYs with deep liquidity and detailed analytics. Built for hands-on DeFi users."
            description="Top banner prompt text"
          />
        </Body>
      </Box>
    </Box>
  );
};

const VaultTable = () => {
  const theme = useTheme();
  const SortIndicator = () => (
    <Box
      aria-hidden
      sx={{
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: theme.spacing(1),
      }}
    >
      <ArrowIcon
        sx={{
          width: theme.spacing(1),
          height: theme.spacing(1),
          color: theme.palette.typography.light,
          transform: 'rotate(0deg)',
        }}
      />
      <ArrowIcon
        sx={{
          width: theme.spacing(1),
          height: theme.spacing(1),
          color: theme.palette.typography.light,
          transform: 'rotate(180deg)',
        }}
      />
    </Box>
  );

  return (
    <TableContainer
      component={Paper}
      sx={{
        boxShadow: 'none',
        background: 'transparent',
        marginTop: theme.spacing(1),
      }}
    >
      <Table
        sx={{
          borderCollapse: 'separate',
          borderSpacing: 0,
          tableLayout: 'fixed',
          '& .MuiTableCell-root': {
            borderBottom: 'none',
          },
        }}
      >
        <TableHead>
          <TableRow
            sx={{
              height: theme.spacing(6.5),
              backgroundColor: theme.palette.common.white,
              '& .MuiTableCell-root:first-of-type': {
                borderTopLeftRadius: theme.shape.borderRadius(),
                borderBottomLeftRadius: theme.shape.borderRadius(),
                width: '33%',
              },
              '& .MuiTableCell-root:last-of-type': {
                borderTopRightRadius: theme.shape.borderRadius(),
                borderBottomRightRadius: theme.shape.borderRadius(),
              },
            }}
          >
            <TableCell sx={{ padding: theme.spacing(2, 3) }}>
              <H5 gutter="none">Vault</H5>
            </TableCell>
            <TableCell sx={{ padding: theme.spacing(2, 1) }}>
              <H5 gutter="none">Yield Token</H5>
            </TableCell>
            <TableCell sx={{ padding: theme.spacing(2, 1) }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <H5 gutter="none">Available Liquidity</H5>
                <SortIndicator />
              </Box>
            </TableCell>
            <TableCell sx={{ padding: theme.spacing(2, 1) }}>
              <H5 gutter="none">Rewards</H5>
            </TableCell>
            <TableCell sx={{ padding: theme.spacing(2, 1) }}>
              <H5 gutter="none">Points</H5>
            </TableCell>
            <TableCell sx={{ padding: theme.spacing(2, 3), textAlign: 'left' }}>
              <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
                <H5 gutter="none">Max APY</H5>
                <SortIndicator />
              </Box>
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* {rows.map((row) => (
            <TableRow
              key={row.name}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.name}
              </TableCell>
              <TableCell align="right">{row.calories}</TableCell>
              <TableCell align="right">{row.fat}</TableCell>
              <TableCell align="right">{row.carbs}</TableCell>
              <TableCell align="right">{row.protein}</TableCell>
            </TableRow>
          ))} */}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const VaultList = () => {
  const theme = useTheme();
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);

  return (
    <Box
      sx={{
        marginTop: theme.spacing(9),
        padding: theme.spacing(0, 9),
      }}
    >
      <TopBanner />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: theme.spacing(3),
          marginBottom: theme.spacing(5),
        }}
      >
        <Toggle
          selectedTabIndex={selectedTokenIndex}
          onChange={(_, value) => setSelectedTokenIndex(Number(value))}
          tabLabels={[
            <FormattedMessage
              defaultMessage="All Tokens"
              description="Toggle label"
            />,
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing(1),
              }}
            >
              <TokenIcon symbol="usdc" size="small" />
              <FormattedMessage
                defaultMessage="USDC"
                description="Toggle label"
              />
            </Box>,
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: theme.spacing(1),
              }}
            >
              <TokenIcon symbol="weth" size="small" />
              <FormattedMessage
                defaultMessage="WETH"
                description="Toggle label"
              />
            </Box>,
          ]}
        />
        <Dropdown
          buttonText={defineMessage({
            defaultMessage: 'Strategy Type',
            description: 'Dropdown button text',
          })}
          dropDownItems={[
            { label: 'All Tokens', href: '/vaults-list' },
            { label: 'USDC', href: '/vaults-list/usdc' },
            { label: 'WETH', href: '/vaults-list/weth' },
          ]}
          open={false}
        />
        <MuiButton
          disableRipple
          sx={{
            height: theme.spacing(5.5),
            minWidth: 0,
            padding: theme.spacing(0, 2.5),
            borderRadius: theme.shape.borderRadius(),
            border: 'none',
            boxShadow: 'none',
            backgroundColor: theme.palette.common.white,
            color: theme.palette.typography.light,
            fontSize: '14px',
            fontWeight: 500,
            lineHeight: '20px',
            textTransform: 'none',
            transition: 'all .2s ease-in-out',
            '&:hover': {
              border: 'none',
              boxShadow: 'none',
              color: theme.palette.primary.light,
              backgroundColor: alpha(theme.palette.primary.light, 0.2),
            },
          }}
        >
          Clear All
        </MuiButton>
      </Box>
      <VaultTable />
    </Box>
  );
};
