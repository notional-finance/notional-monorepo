import { Body, ExternalLink, H5 } from '@notional-finance/mui';
import { ExternalLinkIcon } from '@notional-finance/icons';
import { Box, useTheme, styled } from '@mui/material';
import { FormattedMessage } from 'react-intl';
import { CurveVaultImg } from './curve-vault-img';
import { useVaultStrategyData } from '../hooks';
import { BalancerVaultImg } from './balancer-vault-img';

interface HowItWorksFaqProps {
  tokenSymbol: string;
}

export const HowItWorksFaq = ({ tokenSymbol }: HowItWorksFaqProps) => {
  const theme = useTheme();
  const vaultStrategyData = useVaultStrategyData();

  if (!vaultStrategyData) return null;

  const {
    baseProtocol,
    boosterProtocol,
    primaryBorrowCurrency,
    secondaryCurrency,
    incentiveToken1,
    incentiveToken2,
    vaultStrategyId,
  } = vaultStrategyData;

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
              {'0x05f1ce9c' === vaultStrategyId && (
                <CurveVaultImg tokenSymbol={tokenSymbol} />
              )}
              {'0x77721081' === vaultStrategyId && (
                <BalancerVaultImg tokenSymbol={tokenSymbol} />
              )}
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
                defaultMessage={`1. Take {primaryBorrowCurrency} and provide liquidity to the {primaryBorrowCurrency}/{secondaryCurrency} pool on {baseProtocol}.`}
                values={{
                  primaryBorrowCurrency: primaryBorrowCurrency,
                  secondaryCurrency: secondaryCurrency,
                  baseProtocol: baseProtocol,
                }}
              />
            </BodyText>
            <BodyText>
              <FormattedMessage
                defaultMessage={`2. Stake the {baseProtocol} LP tokens on {boosterProtocol}.`}
                values={{
                  baseProtocol: baseProtocol,
                  boosterProtocol: boosterProtocol,
                }}
              />
            </BodyText>
            <BodyText>
              <FormattedMessage
                defaultMessage={`3. Harvest and reinvest {incentiveToken2} and {incentiveToken1} incentives back into the pool on a weekly basis.`}
                values={{
                  incentiveToken1: incentiveToken1,
                  incentiveToken2: incentiveToken2,
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
            <H5
              sx={{
                textTransform: 'uppercase',
                fontSize: '14px',
                color: theme.palette.typography.light,
              }}
            >
              <FormattedMessage
                defaultMessage={`Total APY = strategy APY + (strategy APY - borrow APY) * leverage`}
              />
            </H5>
          </Box>
          <ExternalLink
            href="https://docs.notional.finance/notional-v3/product-guides/leveraged-vaults"
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
