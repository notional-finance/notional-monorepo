import {
  ONE_WEEK,
  SupportedNetworks,
  TRACKING_EVENTS,
  getFromLocalStorage,
  getNowSeconds,
  setInLocalStorage,
} from '@notional-finance/util';
import { update } from '@intercom/messenger-js-sdk';
import { safeDatadogRum, trackEvent } from '@notional-finance/helpers';

export async function fetchDeBankData(walletAddress: string) {
  const DeBankAPIKey = process.env['NX_DEBANK_API_KEY'] as string | undefined;
  const headers = {
    accept: 'application/json',
    AccessKey: DeBankAPIKey || '',
  };

  try {
    const [balanceResponse, protocolsResponse] = await Promise.all([
      fetch(
        `https://pro-openapi.debank.com/v1/user/total_balance?id=${walletAddress}`,
        {
          method: 'GET',
          headers,
        }
      ),
      fetch(
        `https://pro-openapi.debank.com/v1/user/all_simple_protocol_list?id=${walletAddress}`,
        {
          method: 'GET',
          headers,
        }
      ),
    ]);

    if (!balanceResponse.ok || !protocolsResponse.ok) {
      throw new Error(
        `API Error: Balance ${balanceResponse.status}, Protocols ${protocolsResponse.status}`
      );
    }

    const [balanceData, protocolsData] = await Promise.all([
      balanceResponse.json(),
      protocolsResponse.json(),
    ]);

    const isBorrower =
      protocolsData?.find((data) => data.debt_usd_value > 0) ?? false;

    const lendingProtocols = protocolsData.map((data) => data.id);

    return {
      netWorth: balanceData.total_usd_value,
      isLender: !isBorrower,
      lendingProtocols:
        lendingProtocols && lendingProtocols.length > 0 ? lendingProtocols : [],
    };
  } catch (error) {
    console.error('Failed to fetch DeBank data:', error);
    return {
      netWorth: 0,
      isLender: false,
    };
  }
}

async function getDebBankData(selectedAddress, isReadOnlyAddress) {
  const userSettings = getFromLocalStorage('userSettings');
  const newDeBankWallet = !userSettings.debankAddress;
  const updateDeBankWallet =
    userSettings.debankAddress &&
    !isReadOnlyAddress &&
    userSettings.debankAddress !== selectedAddress;
  const weeklyCheck = (() => {
    if (userSettings.debankTimestamp) {
      const currentDate = getNowSeconds();
      return currentDate - userSettings.debankTimestamp > ONE_WEEK;
    }
    return false;
  })();

  let isFetching = false;
  let currentNetWorth = 0;
  let currentIsLender;
  let currentLendingProtocols = [];

  async function updateDeBankNetWorth(address: string) {
    if (isFetching) return;
    isFetching = true;
    try {
      const { netWorth, isLender, lendingProtocols } = await fetchDeBankData(
        address
      );

      const currentTimestamp = getNowSeconds();
      currentNetWorth = Math.trunc(netWorth);
      currentIsLender = isLender;
      currentLendingProtocols = lendingProtocols;

      const userSettings = getFromLocalStorage('userSettings');
      setInLocalStorage('userSettings', {
        ...userSettings,
        debankAddress: address,
        isLender: isLender,
        lendingProtocols: lendingProtocols,
        debankNetWorth: currentNetWorth,
        debankTimestamp: currentTimestamp,
      });
    } finally {
      isFetching = false;
    }
  }

  if (newDeBankWallet || updateDeBankWallet || weeklyCheck) {
    await updateDeBankNetWorth(selectedAddress);
  }

  return {
    debankNetWorth: !userSettings.debankNetWorth
      ? currentNetWorth
      : userSettings.debankNetWorth,
    isLender:
      userSettings.isLender === undefined
        ? currentIsLender
        : userSettings.isLender,
    lendingProtocols: !userSettings.lendingProtocols
      ? currentLendingProtocols
      : userSettings.lendingProtocols,
  };
}

export async function updateWalletTracking(
  selectedAddress: string,
  isReadOnlyAddress: boolean | undefined,
  accountBalances: any[]
) {
  const balanceData = {
    walletBalance: 0,
    notionalBalance: 0,
  };
  const userSettings = getFromLocalStorage('userSettings');
  let debankNetWorth = 0;
  let isLender;
  let lendingProtocols = [];

  await getDebBankData(selectedAddress, isReadOnlyAddress).then(
    (debankData) => {
      debankNetWorth = debankData.debankNetWorth;
      isLender = debankData.isLender;
      lendingProtocols = debankData.lendingProtocols;
    }
  );

  SupportedNetworks.forEach(() => {
    const walletBalance = accountBalances
      .filter((b) => b.tokenType === 'Underlying' && b.symbol !== 'sNOTE')
      .reduce((acc, b) => acc + b.toFiat('USD').toFloat(), 0);

    const notionalBalance = accountBalances
      .filter((b) => b.tokenType !== 'Underlying' && b.symbol !== 'sNOTE')
      .reduce((acc, b) => acc + b.toFiat('USD').toFloat(), 0);

    if (walletBalance) {
      balanceData.walletBalance = balanceData.walletBalance + walletBalance;
    }

    if (notionalBalance) {
      balanceData.notionalBalance =
        balanceData.notionalBalance + notionalBalance;
    }
  });

  const totalBalance = balanceData.notionalBalance + balanceData.walletBalance;

  if (
    !userSettings.connectedWallets ||
    (userSettings.connectedWallets &&
      !userSettings.connectedWallets.includes(selectedAddress))
  ) {
    const createdAt = Math.floor(Date.now() / 1000);
    update({
      created_at: createdAt,
    });
    setInLocalStorage('userSettings', {
      ...userSettings,
      connectedWallets: userSettings.connectedWallets
        ? [...userSettings.connectedWallets, selectedAddress]
        : [selectedAddress],
    });
  }

  trackEvent(TRACKING_EVENTS.WALLET_CONNECTED, {
    id: selectedAddress,
    walletAddress: selectedAddress,
    TotalWalletBalance: balanceData.walletBalance,
    TotalNotionalBalance: balanceData.notionalBalance,
    TotalBalance: totalBalance,
    DeBankNetWorth: debankNetWorth,
    IsLender:
      lendingProtocols && lendingProtocols.length > 0 ? isLender : undefined,
    LendingProtocols: lendingProtocols,
  });

  safeDatadogRum.setUser({
    id: selectedAddress,
    newUser:
      userSettings.connectedWallets && userSettings.connectedWallets.length > 0
        ? false
        : true,
    walletAddress: selectedAddress,
    TotalWalletBalance: balanceData.walletBalance,
    TotalNotionalBalance: balanceData.notionalBalance,
    TotalBalance: totalBalance,
    DeBankNetWorth: debankNetWorth,
    IsLender:
      lendingProtocols && lendingProtocols.length > 0 ? isLender : undefined,
    LendingProtocols: lendingProtocols,
  });

  update({
    userId: selectedAddress,
    name: selectedAddress,
    customAttributes: {
      TotalWalletBalance: balanceData.walletBalance,
      TotalNotionalBalance: balanceData.notionalBalance,
      TotalBalance: totalBalance,
      DeBankNetWorth: debankNetWorth,
      IsLender:
        lendingProtocols && lendingProtocols.length > 0 ? isLender : undefined,
      LendingProtocols: lendingProtocols,
    },
  });
}
