import { Body, ExternalLink, H4, H5 } from '@notional-finance/mui';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { Box, useTheme, styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { CurveVaultImg } from './curve-vault-img';

interface HowItWorksFaqProps {
  tokenSymbol: string;
  vaultAddress: string;
}

interface vaultsData {
  baseProtocol: string;
  boosterProtocol: string;
  primaryBorrowCurrency: string;
  secondaryCurrency: string;
  incentiveToken1: string;
  incentiveToken2: string;
}

export const HowItWorksFaq = ({
  tokenSymbol,
  vaultAddress,
}: HowItWorksFaqProps) => {
  const theme = useTheme();

  const vaultsData: Record<string, vaultsData> = {
    '0xdb08f663e5d765949054785f2ed1b2aa1e9c22cf': {
      baseProtocol: 'Curve',
      boosterProtocol: 'Convex',
      primaryBorrowCurrency: 'FRAX',
      secondaryCurrency: 'USDC',
      incentiveToken1: 'CRV',
      incentiveToken2: 'CVX',
    },
    // balancerTBD: {
    //   baseProtocol: 'Balancer',
    //   boosterProtocol: 'Aura',
    //   primaryBorrowCurrency: 'ETH',
    //   secondaryCurrency: 'wstETH',
    //   incentiveToken1: 'BAL',
    //   incentiveToken2: 'AURA',
    // },
  };

  return (
    <div>
      {tokenSymbol && (
        <>
          <Box
            sx={{
              background: theme.palette.background.default,
              padding: theme.spacing(3),
              border: theme.shape.borderStandard,
              borderRadius: theme.shape.borderRadius(),
            }}
          >
            <BodyText>
              <FormattedMessage
                defaultMessage={`You deposit into the leveraged vault and the vault borrows from Notional according to the leverage you select. Your deposit and the borrowed funds are then controlled by the vault.`}
                values={{
                  tokenSymbol,
                }}
              />
            </BodyText>
            <BodyText>
              <FormattedMessage
                defaultMessage={`The vault contract then deploys all the funds into the automated strategy.`}
              />
            </BodyText>
            <ImageWrapper>
              {'0xdb08f663e5d765949054785f2ed1b2aa1e9c22cf' ===
                vaultAddress && <CurveVaultImg tokenSymbol={tokenSymbol} />}
            </ImageWrapper>
            <H5
              sx={{
                color: theme.palette.typography.main,
                marginBottom: theme.spacing(2),
              }}
            >
              <FormattedMessage defaultMessage={'The Strategy'} />
            </H5>
            <BodyText>
              <FormattedMessage
                defaultMessage={`Take {primaryBorrowCurrency} and provide liquidity to the {primaryBorrowCurrency}/{secondaryCurrency} pool on {baseProtocol}.`}
                values={{
                  primaryBorrowCurrency:
                    vaultsData[vaultAddress].primaryBorrowCurrency,
                  secondaryCurrency: vaultsData[vaultAddress].secondaryCurrency,
                  baseProtocol: vaultsData[vaultAddress].baseProtocol,
                }}
              />
            </BodyText>
            <BodyText>
              <FormattedMessage
                defaultMessage={`Stake the {baseProtocol} LP tokens on {boosterProtocol}.`}
                values={{
                  baseProtocol: vaultsData[vaultAddress].baseProtocol,
                  boosterProtocol: vaultsData[vaultAddress].boosterProtocol,
                }}
              />
            </BodyText>
            <BodyText>
              <FormattedMessage
                defaultMessage={`Harvest and reinvest {incentiveToken2} and {incentiveToken1} incentives back into the pool on a weekly basis.`}
                values={{
                  incentiveToken1: vaultsData[vaultAddress].incentiveToken1,
                  incentiveToken2: vaultsData[vaultAddress].incentiveToken2,
                }}
              />
            </BodyText>
            <H5
              sx={{
                color: theme.palette.typography.main,
                marginBottom: theme.spacing(2),
              }}
            >
              <FormattedMessage defaultMessage={'RETURNS'} />
            </H5>
            <BodyText>
              <FormattedMessage
                defaultMessage={`You earn the strategy APY on your deposit + borrowed funds and you pay the borrow APY on your borrowed funds.`}
              />
            </BodyText>
            <H4
              sx={{
                textTransform: 'uppercase',
                color: theme.palette.typography.light,
              }}
            >
              <FormattedMessage
                defaultMessage={`Total APY = strategy APY + (strategy APY - borrow APY) * leverage`}
              />
            </H4>
          </Box>
          <ExternalLink
            href="https://docs.notional.finance/leveraged-vaults/leveraged-vaults/balancer-aura-wsteth-weth-strategy"
            textDecoration
            accent
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: theme.spacing(3),
            }}
          >
            <FormattedMessage
              defaultMessage={'Leveraged Vault Documentation'}
            />
            <ExternalLinkIcon
              sx={{ fontSize: '12px', marginLeft: theme.spacing(0.5) }}
            />
          </ExternalLink>
        </>
      )}
    </div>
  );
};

const BodyText = styled(Body)(
  ({ theme }) => `
    margin-bottom: ${theme.spacing(2)};
  `
);

const ImageWrapper = styled(Box)(
  ({ theme }) => `
    margin-bottom: ${theme.spacing(4)};
    margin-top: ${theme.spacing(4)};
    svg {
      width: 100%;
      height: 100%;
    }
  
  `
);

export default HowItWorksFaq;
