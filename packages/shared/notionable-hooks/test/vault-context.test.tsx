import {
  AccountFetchMode,
  Registry,
  TokenBalance,
} from '@notional-finance/core-entities';
import { Network, PRIME_CASH_VAULT_MATURITY } from '@notional-finance/util';
import { renderVaultTradeContext } from './renderTradeContext';
import { act } from '@testing-library/react-hooks';

jest.setTimeout(15_000);
describe.withForkAndRegistry(
  {
    network: Network.arbitrum,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Vault Context',
  () => {
    const vaultAddress = '0xdb08f663e5d765949054785f2ed1b2aa1e9c22cf';

    describe('Prime Cash', () => {
      it('Create Position', async () => {
        const depositAmount = 1;
        const debtMaturity = PRIME_CASH_VAULT_MATURITY;
        const approve = true;

        const {
          result: { result, waitForNextUpdate },
          submitTransaction,
          approveToken,
        } = await renderVaultTradeContext(
          'CreateVaultPosition',
          vaultAddress,
          signer
        );

        expect(result.current.state.selectedDepositToken).toBe('FRAX');

        act(() => {
          result.current.updateState({
            debt: Registry.getTokenRegistry().getVaultDebt(
              Network.arbitrum,
              vaultAddress,
              debtMaturity
            ),
            riskFactorLimit: {
              riskFactor: 'leverageRatio',
              limit: 3,
            },
            depositBalance: TokenBalance.fromFloat(
              depositAmount,
              result.current.state.deposit!
            ),
          });
        });

        await waitForNextUpdate({ timeout: 4000 });

        expect(result.current.state.canSubmit).toBe(true);
        expect(result.current.state.calculationSuccess).toBe(true);

        if (approve) {
          await approveToken(result.current.state.deposit!.address);
        }

        act(() => {
          result.current.updateState({ confirm: true });
        });

        await waitForNextUpdate();

        expect(result.current.state.populatedTransaction).toBeDefined();

        const { rcpt } = await submitTransaction();
        expect(rcpt).toBeDefined();
      }, 10_000);

      // it('Deposit Collateral');
      // it('Increase Position');
      // it('Roll Position');
      // it('Withdraw');
      // it('Deleverage');
    });
  }
);
