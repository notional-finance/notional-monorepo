import {
  Registry,
  AccountFetchMode,
  AccountDefinition,
} from '@notional-finance/core-entities';
import {
  AccountRiskProfile,
  VaultAccountRiskProfile,
} from '@notional-finance/risk-engine';
import { Network, SupportedNetworks } from '@notional-finance/util';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const DATA_URL = process.env['DATA_BASE_URL'] as string;
const CLOUDFLARE_ACCOUNT_ID = process.env['CLOUDFLARE_ACCOUNT_ID'] as string;
const R2_ACCESS_KEY_ID = process.env['R2_ACCESS_KEY_ID'] as string;
const R2_SECRET_ACCESS_KEY = process.env['R2_SECRET_ACCESS_KEY'] as string;

const S3 = new S3Client({
  region: 'auto',
  endpoint: `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export async function calculateAccountRisks() {
  Registry.initialize(
    DATA_URL,
    AccountFetchMode.BATCH_ACCOUNT_VIA_SERVER,
    false,
    true,
    false
  );

  // First trigger a refresh for all supported networks
  await Promise.all(
    SupportedNetworks.map((network) => {
      if (network === Network.all) return Promise.resolve();
      return Registry.triggerRefresh(network);
    })
  );

  await Promise.all(
    SupportedNetworks.filter((n) => n !== Network.all).map(async (n) => {
      const results = saveAccountRiskProfiles(n);
      try {
        await S3.send(
          new PutObjectCommand({
            Bucket: 'account-cache-r2',
            Key: `${n}/accounts/riskProfiles`,
            Body: JSON.stringify(results),
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

  const riskProfiles = accounts
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

        return {
          address: account.address,
          riskFactors,
          hasCrossCurrencyRisk,
          vaultRiskFactors: VaultAccountRiskProfile.getAllRiskProfiles(
            account
          ).map((v) => {
            const _riskFactors = v.getAllRiskFactors();
            const riskFactors = {
              ..._riskFactors,
              liquidationPrice: _riskFactors.liquidationPrice.map((l) => ({
                ...l,
                asset: l.asset.id,
              })),
            };
            return {
              vaultAddress: v.vaultAddress,
              riskFactors,
            };
          }),
        };
      } catch (e) {
        console.error(e);
        return undefined;
      }
    })
    .filter((a) => a !== undefined);

  return riskProfiles;
}