/*
  const onWalletConnect$ = state$.pipe(
    pairwise(),
    filter(([prev, cur]) => {
      const didConnect = prev.wallet === undefined && cur.wallet !== undefined;
      const didChange =
        prev.wallet &&
        cur.wallet &&
        prev.wallet?.selectedAddress !== cur.wallet.selectedAddress;
      return didChange || didConnect;
    }),
    map(([_, cur]) => {
      return {
        isAccountPending: true,
        isAccountReady: false,
        holdingsGroups: undefined,
        // Selected address must always be defined here
        selectedAccount: cur.wallet?.selectedAddress,
      };
    })
  );

  const onWalletDisconnect$ = state$.pipe(
    pairwise(),
    filter(
      ([prev, cur]) => prev.wallet !== undefined && cur.wallet === undefined
    ),
    map(([_, cur]) => {
      if (cur.selectedNetwork) disconnectAccount(cur.selectedNetwork);

      return {
        isAccountPending: false,
        isAccountReady: false,
        holdingsGroups: [],
        selectedAccount: undefined,
      };
    })
  );

  // Sets the account when the data is ready and fetched
  const onAccountPending$ = state$.pipe(
    map(
      ({
        isAccountPending,
        selectedAccount,
        selectedNetwork,
        isNetworkReady,
        wallet,
      }) =>
        isAccountPending && isNetworkReady && selectedAccount && selectedNetwork
          ? { selectedAccount, selectedNetwork, wallet }
          : undefined
    ),
    filterEmpty(),
    distinctUntilChanged((p, c) => p.selectedAccount === c.selectedAccount),
    switchMap(({ selectedAccount, selectedNetwork, wallet }) =>
      onAccountPending(
        selectedAccount,
        selectedNetwork,
        wallet?.label || 'unknown'
      )
    )
  );

  const onAccountConnect$ = state$.pipe(
    distinctUntilChanged((p, c) => p.selectedAccount === c.selectedAccount),
    filter(({ selectedAccount }) => selectedAccount !== undefined),
    switchMap(({ selectedAccount }) => {
      // Chain Analysis Sanctioned Address Oracle
      const sanctionList = new Contract(
        '0x40c57923924b5c5c5455c48d93317139addac8fb',
        ['function isSanctioned(address) view returns (bool)'],
        getProviderFromNetwork(Network.Mainnet)
      );
      return from(
        (
          sanctionList['isSanctioned'](selectedAccount) as Promise<boolean>
        ).then((isSanctionedAddress) => ({ isSanctionedAddress }))
      );
    })
  );

  const onNFTUnlock$ = state$.pipe(
    distinctUntilChanged((p, c) => p.hasContestNFT === c.hasContestNFT),
    tap(({ hasContestNFT, selectedAccount, contestTokenId }) => {
      if (selectedAccount && hasContestNFT === BETA_ACCESS.CONFIRMED) {
        trackEvent(TRACKING_EVENTS.NFT_UNLOCK, {
          selectedAccount,
          contestTokenId: contestTokenId || 'unknown',
        });
      }
    })
  );
*/
