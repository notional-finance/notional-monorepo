import {
  TransactionStatus,
  useNotionalContext,
  useTradeContext,
  useTransactionStatus,
  useVaultContext,
} from '../src';
import { renderHook, act } from '@testing-library/react-hooks';
import { Wrapper } from './wrapper';
import { TradeType, VaultTradeType } from '@notional-finance/notionable';
import { Network, NotionalAddress } from '@notional-finance/util';
import { Contract, Signer, constants, ethers } from 'ethers';
import { parseTransactionLogs } from '@notional-finance/transaction';
import { ERC20ABI, ERC20 } from '@notional-finance/contracts';

export const renderTradeContext = async (
  tradeType: TradeType,
  signer: Signer
) => {
  const signerAddress = await signer.getAddress();

  const r = renderHook(
    () => {
      const { globalState, globalState$, updateNotional } =
        useNotionalContext();
      const { state, state$, updateState } = useTradeContext(tradeType);
      const { transactionHash, transactionStatus, onSubmit } =
        useTransactionStatus();
      const {
        onSubmit: onSubmitApprove,
        transactionStatus: approvalStatus,
        transactionHash: approvalHash,
      } = useTransactionStatus();

      return {
        state,
        updateState,
        state$,
        globalState,
        globalState$,
        updateNotional,
        transactionHash,
        transactionStatus,
        onSubmit,
        onSubmitApprove,
        approvalStatus,
        approvalHash,
      };
    },
    {
      wrapper: Wrapper,
    }
  );

  act(() => {
    r.result.current.updateNotional({
      wallet: {
        signer,
        selectedChain: Network.arbitrum,
        selectedAddress: signerAddress,
        isReadOnlyAddress: false,
      },
    });
  });

  await r.waitFor(
    () => {
      return (
        r.result.current.globalState.isNetworkReady &&
        r.result.current.state.isReady &&
        r.result.current.globalState.isAccountReady
      );
    },
    { timeout: 8000 }
  );

  const submitTransaction = async () => {
    const txn = r.result.current.state.populatedTransaction;
    if (!txn || r.result.current.state.transactionError)
      throw Error(r.result.current.state.transactionError);

    act(() => {
      r.result.current.onSubmit(txn);
    });

    await r.waitFor(
      () =>
        r.result.current.transactionStatus === TransactionStatus.CONFIRMED ||
        r.result.current.transactionStatus === TransactionStatus.NONE ||
        r.result.current.transactionStatus === TransactionStatus.REVERT,
      { timeout: 8000 }
    );

    if (r.result.current.transactionStatus !== TransactionStatus.CONFIRMED)
      throw Error(
        `Transaction Reverted: ${r.result.current.transactionStatus}`
      );

    // This is the transaction receipt
    const rcpt =
      r.result.current.globalState.completedTransactions[
        r.result.current.transactionHash!
      ];
    const { transaction } = parseTransactionLogs(
      r.result.current.globalState.selectedNetwork!,
      rcpt.blockNumber,
      rcpt.logs
    );

    return { transaction, rcpt };
  };

  const approveToken = async (address: string) => {
    const spender =
      NotionalAddress[r.result.current.globalState.selectedNetwork!];
    const allowance = constants.MaxUint256;
    const erc20 = new Contract(
      ethers.utils.getAddress(address),
      ERC20ABI
    ) as ERC20;
    const txn = await erc20.populateTransaction.approve(spender, allowance);

    act(() => {
      r.result.current.onSubmitApprove(txn);
    });

    await r.waitFor(
      () => r.result.current.approvalStatus === TransactionStatus.CONFIRMED,
      { timeout: 8000 }
    );
  };

  return { result: r, submitTransaction, approveToken };
};

export const renderVaultTradeContext = async (
  tradeType: VaultTradeType,
  vaultAddress: string,
  signer: Signer
) => {
  const signerAddress = await signer.getAddress();

  const r = renderHook(
    () => {
      const { globalState, globalState$, updateNotional } =
        useNotionalContext();
      const { state, state$, updateState } = useVaultContext();
      const { transactionHash, transactionStatus, onSubmit } =
        useTransactionStatus();
      const {
        onSubmit: onSubmitApprove,
        transactionStatus: approvalStatus,
        transactionHash: approvalHash,
      } = useTransactionStatus();

      return {
        state,
        updateState,
        state$,
        globalState,
        globalState$,
        updateNotional,
        transactionHash,
        transactionStatus,
        onSubmit,
        onSubmitApprove,
        approvalStatus,
        approvalHash,
      };
    },
    {
      wrapper: Wrapper,
    }
  );

  act(() => {
    r.result.current.updateNotional({
      wallet: {
        signer,
        selectedChain: Network.arbitrum,
        selectedAddress: signerAddress,
        isReadOnlyAddress: false,
      },
    });
  });

  act(() => {
    r.result.current.updateState({ tradeType, vaultAddress });
  });

  await r.waitFor(
    () => {
      return (
        r.result.current.globalState.isNetworkReady &&
        r.result.current.state.isReady &&
        r.result.current.globalState.isAccountReady
      );
    },
    { timeout: 8000 }
  );

  const submitTransaction = async () => {
    const txn = r.result.current.state.populatedTransaction;
    if (!txn || r.result.current.state.transactionError)
      throw Error(r.result.current.state.transactionError);

    act(() => {
      r.result.current.onSubmit(txn);
    });

    await r.waitFor(
      () =>
        r.result.current.transactionStatus === TransactionStatus.CONFIRMED ||
        r.result.current.transactionStatus === TransactionStatus.NONE ||
        r.result.current.transactionStatus === TransactionStatus.REVERT,
      { timeout: 8000 }
    );

    if (r.result.current.transactionStatus !== TransactionStatus.CONFIRMED)
      throw Error(
        `Transaction Reverted: ${r.result.current.transactionStatus}`
      );

    // This is the transaction receipt
    const rcpt =
      r.result.current.globalState.completedTransactions[
        r.result.current.transactionHash!
      ];

    return { rcpt };
  };

  const approveToken = async (address: string) => {
    const spender =
      NotionalAddress[r.result.current.globalState.selectedNetwork!];
    const allowance = constants.MaxUint256;
    const erc20 = new Contract(
      ethers.utils.getAddress(address),
      ERC20ABI
    ) as ERC20;
    const txn = await erc20.populateTransaction.approve(spender, allowance);

    act(() => {
      r.result.current.onSubmitApprove(txn);
    });

    await r.waitFor(
      () => r.result.current.approvalStatus === TransactionStatus.CONFIRMED,
      { timeout: 8000 }
    );
  };

  return { result: r, submitTransaction, approveToken };
};
