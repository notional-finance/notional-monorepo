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

  const calculateHoldingGroups$ = state$.pipe(
    filter((s) => s.isAccountReady),
    distinctUntilChanged((p, c) => p.selectedAccount === c.selectedAccount),
    switchMap((s) => {
      if (s.selectedNetwork && s.selectedAccount) {
        return Registry.getAccountRegistry()
          .subscribeAccount(s.selectedNetwork, s.selectedAccount)
          .pipe(
            filter((a) => a !== null),
            map((account) => {
              const balances =
                account?.balances.filter(
                  (b) =>
                    !b.isZero() &&
                    !b.isVaultToken &&
                    b.token.tokenType !== 'Underlying' &&
                    b.token.tokenType !== 'NOTE'
                ) || [];
              const assets = balances.filter((b) => b.isPositive());
              const debts = balances.filter((b) => b.isNegative());

              const holdingsGroups = assets.reduce((l, asset) => {
                const matchingDebts = debts.filter(
                  (b) => b.currencyId === asset.currencyId
                );
                const matchingAssets = assets.filter(
                  (b) =>
                    b.currencyId === asset.currencyId &&
                    asset.tokenType === 'nToken'
                );

                // Only creates a grouped holding if there is exactly one matching asset and debt
                if (matchingDebts.length === 1 && matchingAssets.length === 1) {
                  const asset = matchingAssets[0];
                  const debt = matchingDebts[0];
                  const presentValue = asset
                    .toUnderlying()
                    .add(debt.toUnderlying());
                  const leverageRatio =
                    debt
                      .toUnderlying()
                      .neg()
                      .ratioWith(presentValue)
                      .toNumber() / RATE_PRECISION;

                  // NOTE: enforce a minimum leverage ratio on these to ensure that dust balances
                  // don't create leveraged positions
                  if (leverageRatio > 0.05) {
                    l.push({ asset, debt, presentValue, leverageRatio });
                  }
                }

                return l;
              }, [] as { asset: TokenBalance; debt: TokenBalance; presentValue: TokenBalance; leverageRatio: number }[]);

              return { holdingsGroups };
            })
          );
      }

      return of(undefined);
    }),
    filterEmpty()
  );

    const calculateIncentives$ = selectedAccount(state$).pipe(
    filterEmpty(),
    map((a) => {
      return { accruedIncentives: calculateAccruedIncentives(a) };
    })
  );
  */
