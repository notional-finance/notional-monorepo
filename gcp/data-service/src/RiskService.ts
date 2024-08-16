import {
  Registry,
  AccountFetchMode,
  AccountDefinition,
  getArbBoosts,
} from '@notional-finance/core-entities';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import {
  Network,
  SupportedNetworks,
  floorToMidnight,
  getNowSeconds,
  getProviderFromNetwork,
  groupArrayByKey,
} from '@notional-finance/util';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const DATA_URL = process.env['API_URL'] as string;
const CLOUDFLARE_ACCOUNT_ID = process.env['CLOUDFLARE_ACCOUNT_ID'] as string;

let cachedS3Client: S3Client;
export function getS3() {
  const R2_ACCESS_KEY_ID = process.env['R2_ACCESS_KEY_ID'] as string;
  const R2_SECRET_ACCESS_KEY = process.env['R2_SECRET_ACCESS_KEY'] as string;

  if (!cachedS3Client) {
    cachedS3Client = new S3Client({
      region: 'auto',
      endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
      },
    });
  }
  return cachedS3Client;
}

export async function calculateAccountRisks() {
  const SUBGRAPH_API_KEY = process.env['SUBGRAPH_API_KEY'] as string;

  Registry.initialize(
    { NX_SUBGRAPH_API_KEY: SUBGRAPH_API_KEY },
    DATA_URL,
    AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER,
    false,
    true,
    false
  );
  Registry.getAccountRegistry().setSubgraphAPIKey = SUBGRAPH_API_KEY;

  // First trigger a refresh for all supported networks
  await Promise.all(
    SupportedNetworks.map((network) => {
      if (network === Network.all) return Promise.resolve();
      return Registry.triggerRefresh(network);
    })
  );

  await Promise.all(
    SupportedNetworks.filter((n) => n !== Network.all).map(async (n) => {
      const { portfolioRiskProfiles, vaultRiskProfiles } =
        saveAccountRiskProfiles(n);
      try {
        await getS3().send(
          new PutObjectCommand({
            Bucket: 'view-cache-r2',
            Key: `${n}/accounts/portfolioRisk`,
            Body: JSON.stringify(portfolioRiskProfiles),
          })
        );
        await getS3().send(
          new PutObjectCommand({
            Bucket: 'view-cache-r2',
            Key: `${n}/accounts/vaultRisk`,
            Body: JSON.stringify(vaultRiskProfiles),
          })
        );
      } catch (e) {
        console.error(e);
      }
    })
  );
}

function saveAccountRiskProfiles(network: Network) {
  const accounts = Registry.getAccountRegistry()
    .getAllSubjectKeys(network)
    .map((a) => Registry.getAccountRegistry().getLatestFromSubject(network, a))
    .filter((account) => {
      // Only return accounts that have some balance
      return (
        account?.systemAccountType === 'None' &&
        (account.balances.length > 0 ||
          !account.balances.every((b) => b.isZero()))
      );
    }) as AccountDefinition[];

  const vaultRiskProfiles: ReturnType<typeof getVaultRiskFactors> = [];

  const portfolioRiskProfiles = accounts
    .map((account) => {
      try {
        const accountRiskProfile = new AccountRiskProfile(
          account.balances,
          account.network
        );
        const freeCollateralFactors =
          accountRiskProfile.freeCollateralFactors();
        const hasCrossCurrencyRisk = freeCollateralFactors.some((e) =>
          e.totalAssetsLocal.add(e.totalDebtsLocal).isNegative()
        );
        const _riskFactors = accountRiskProfile.getAllRiskFactors();
        const riskFactors = {
          ..._riskFactors,
          liquidationPrice: _riskFactors.liquidationPrice.map((l) => ({
            ...l,
            asset: l.asset.id,
          })),
        };
        const vaultRiskFactors = getVaultRiskFactors(account);

        if (vaultRiskFactors.length > 0) {
          vaultRiskProfiles.push(...vaultRiskFactors);
        }

        return {
          address: account.address,
          riskFactors,
          hasCrossCurrencyRisk,
        };
      } catch (e) {
        console.error(e);
        return undefined;
      }
    })
    .filter((a) => a !== undefined);

  return { portfolioRiskProfiles, vaultRiskProfiles };
}

function getVaultRiskFactors(account: AccountDefinition) {
  return (
    VaultAccountRiskProfile.getAllRiskProfiles(account)
      // Filter out empty vault accounts
      .filter((v) => !(v.vaultShares.isZero() && v.vaultDebt.isZero()))
      .map((v) => {
        const _riskFactors = v.getAllRiskFactors();
        const riskFactors = {
          ..._riskFactors,
          liquidationPrice: _riskFactors.liquidationPrice.map((l) => ({
            ...l,
            asset: l.asset.id,
          })),
        };
        const vaultName = Registry.getConfigurationRegistry().getVaultName(
          v.network,
          v.vaultAddress
        );

        return {
          vaultAddress: v.vaultAddress,
          vaultName,
          account: account.address,
          riskFactors,
        };
      })
  );
}

export async function calculatePointsAccrued(
  network: Network,
  blockNumber?: number
) {
  const SUBGRAPH_API_KEY = process.env['SUBGRAPH_API_KEY'] as string;
  Registry.initialize(
    { NX_SUBGRAPH_API_KEY: SUBGRAPH_API_KEY },
    DATA_URL,
    AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER,
    false,
    true,
    false
  );
  console.log('calculatePointsAccrued: Setting subgraph API key');
  Registry.getAccountRegistry().setSubgraphAPIKey = SUBGRAPH_API_KEY;
  console.log('calculatePointsAccrued: Triggering registry refresh');
  await Registry.triggerRefresh(network);
  console.log('calculatePointsAccrued: Getting block time');
  const blockTime = blockNumber
    ? (await getProviderFromNetwork(network).getBlock(blockNumber)).timestamp
    : getNowSeconds();
  console.log(`calculatePointsAccrued: Block time: ${blockTime}`);
  if (blockNumber) {
    await Registry.getAccountRegistry().triggerRefreshPromise(
      network,
      blockNumber
    );
  }
  console.log('calculatePointsAccrued: Getting all accounts');
  const allAccounts = Registry.getAccountRegistry()
    .getAllSubjectKeys(network)
    .map((a) => Registry.getAccountRegistry().getLatestFromSubject(network, a))
    .filter((account) => {
      return (
        account?.systemAccountType === 'None' &&
        (account.balances.length > 0 ||
          !account.balances
            .filter((b) => b.symbol !== 'NOTE' && b.symbol !== 'sNOTE')
            .every((b) => b.isZero()))
      );
    }) as AccountDefinition[];
  const date = floorToMidnight(blockTime);

  return allAccounts.flatMap((a: AccountDefinition) => {
    const portfolioPoints = groupArrayByKey(
      a.balances.filter((t) => t.token.currencyId && !t.isVaultToken),
      (t) => t.currencyId
    )
      .filter(
        (g) =>
          // Exclude currencies where this is leverage
          !(g.find((t) => t.isNegative()) && g.find((t) => t.isPositive()))
      )
      .flatMap((g) => {
        return g.map((t) => ({
          account: a.address,
          date,
          token: t.tokenId,
          points:
            t.toUnderlying().abs().toFiat('USD').toFloat() *
            getArbBoosts(t.token, t.isNegative()),
        }));
      });

    const vaultPoints = VaultAccountRiskProfile.getAllRiskProfiles(a)
      // Filter out empty vault accounts
      .filter((v) => !(v.vaultShares.isZero() && v.vaultDebt.isZero()))
      .map((v) => ({
        account: a.address,
        date,
        token: v.vaultShares.tokenId,
        points:
          v.netWorth().toFiat('USD').toFloat() *
          getArbBoosts(v.vaultShares.token, false),
      }));

    return portfolioPoints
      .concat(vaultPoints)
      .filter(({ points }) => points > 0);
  });
}
