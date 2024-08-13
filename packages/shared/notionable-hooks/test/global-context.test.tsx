import { AccountFetchMode } from '@notional-finance/core-entities';
import {
  TransactionStatus,
  useNotionalContext,
  useTransactionStatus,
} from '../src';
import { Network } from '@notional-finance/util';
import { act, renderHook } from '@testing-library/react-hooks';
import { Wrapper } from './wrapper';
import { EnablePrimeBorrow } from '@notional-finance/transaction';

describe.withForkAndRegistry(
  {
    network: Network.arbitrum,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Global Context',
  () => {
    const renderGlobalContext = async () => {
      const r = renderHook(
        () => {
          const { globalState, globalState$, updateNotional } =
            useNotionalContext();
          const { transactionHash, transactionStatus, onSubmit } =
            useTransactionStatus();
          return {
            transactionHash,
            transactionStatus,
            onSubmit,
            globalState,
            globalState$,
            updateNotional,
          };
        },
        {
          wrapper: Wrapper,
        }
      );

      await r.waitFor(() => {
        return r.result.current.globalState.isNetworkReady;
      });

      return r;
    };

    describe('Submit Transaction', () => {
      it('submits and listens for a transaction', async () => {
        const { result, waitFor } = await renderGlobalContext();
        const signerAddress = await signer.getAddress();

        act(() => {
          result.current.updateNotional({
            wallet: {
              signer,
              selectedChain: Network.arbitrum,
              selectedAddress: signerAddress,
              isReadOnlyAddress: false,
            },
          });
        });

        await waitFor(
          () => {
            return result.current.globalState.isAccountReady;
          },
          { timeout: 4000 }
        );

        const txn = await EnablePrimeBorrow({
          address: signerAddress,
          network: Network.arbitrum,
          redeemToWETH: false,
          accountBalances: [],
          maxWithdraw: false,
        });

        act(() => {
          result.current.onSubmit(txn);
        });

        expect(result.current.transactionStatus).toBe(
          TransactionStatus.WAIT_USER_CONFIRM
        );

        await waitFor(
          () => {
            return result.current.transactionHash !== undefined;
          },
          { timeout: 4000 }
        );
        expect(result.current.transactionStatus).toBe(
          TransactionStatus.SUBMITTED
        );

        expect(
          result.current.globalState.sentTransactions[
            result.current.transactionHash!
          ]
        ).toBeDefined();

        await waitFor(
          () => {
            return (
              result.current.transactionStatus === TransactionStatus.CONFIRMED
            );
          },
          { timeout: 4000 }
        );

        expect(
          result.current.globalState.sentTransactions[
            result.current.transactionHash!
          ]
        ).toBeUndefined();
        expect(
          result.current.globalState.completedTransactions[
            result.current.transactionHash!
          ]
        ).toBeDefined();

        expect(result.current.transactionStatus).toBe(
          TransactionStatus.CONFIRMED
        );
      }, 10_000);
    });
  }
);
