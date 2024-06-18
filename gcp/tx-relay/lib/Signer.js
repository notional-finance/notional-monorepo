"use strict";
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSignerAddresses = exports.sendTransaction = void 0;
var tslib_1 = require("tslib");
var ethers_1 = require("ethers");
var ethers_gcp_kms_signer_1 = require("ethers-gcp-kms-signer");
var kmsCredentials = {
    projectId: "monitoring-agents",
    locationId: "global",
    keyRingId: "autotasks",
    keyId: "",
    keyVersion: "1", // the version of the key
};
var rpcUrls = {
    mainnet: "https://rpc.mevblocker.io",
    arbitrum: "https://arb-mainnet.g.alchemy.com/v2/pq08EwFvymYFPbDReObtP-SFw3bCes8Z",
    sepolia: "https://eth-sepolia.g.alchemy.com/v2/pq08EwFvymYFPbDReObtP-SFw3bCes8Z",
};
var Key;
(function (Key) {
    Key["reinvestment"] = "reinvestment";
    Key["liquidation"] = "liquidation-2";
})(Key || (Key = {}));
// addresses need to be lowercased
var Address = {
    TREASURY_MANAGER: '0x53144559c0d4a3304e2dd9dafbd685247429216d'.toLowerCase(),
    AaveV3Pool_ARBITRUM: '0x794a61358d6845594f94dc1db02a252b5b4814ad'.toLowerCase(),
    AaveV3Pool_MAINNET: '0x87870bca3f3fd6335c3f4ce8392d69350b4fa4e2'.toLowerCase(),
    AaveFlashLiquidator_MAINNET: '0xb33e0b9e5ff443fdfe48d8a49f45828918bdab8c'.toLowerCase(),
    AaveFlashLiquidator_ARBITRUM: '0x78e41d1389f3db7c196f13088d1f99a319ffcfbe'.toLowerCase(),
    Multicall3: '0xcA11bde05977b3631167028862bE2a173976CA11'.toLowerCase(),
    initializeAllMarkets_ARBITRUM: '0x9b6C04D1481473B2e52CaEB85822072C35460f27'.toLowerCase(),
    settleAccounts_ARBITRUM: '0x22349F0b9b6294dA5526c9E9383164d97c45ACCD'.toLowerCase(),
};
var Sign;
(function (Sign) {
    Sign["flashLoan"] = "0xab9c4b5d";
    Sign["flashLiquidate"] = "0x7bbeeafd";
    Sign["claimVaultRewardTokens"] = "0x36e8053c";
    Sign["reinvestVaultReward"] = "0xe800d559";
    Sign["investWETHAndNOTE"] = "0x162c2a8e";
    Sign["executeTrade"] = "0x8df6c3ce";
    Sign["aggregate3"] = "0x82ad56cb";
    Sign["harvestAssetsFromNotional"] = "0x295732fb";
    Sign["initializeAllMarkets"] = "0x9f8fad32";
    Sign["settleAccounts"] = "0xd7f4893e";
    Sign["settleVaultsAccounts"] = "0x8261f4ba";
})(Sign || (Sign = {}));
var whitelist = {
    mainnet: (_a = {},
        _a[Address.AaveFlashLiquidator_MAINNET] = [Sign.flashLiquidate],
        _a[Address.TREASURY_MANAGER] = [Sign.claimVaultRewardTokens, Sign.reinvestVaultReward, Sign.investWETHAndNOTE, Sign.executeTrade],
        _a[Address.AaveV3Pool_MAINNET] = [Sign.flashLoan],
        _a[Address.Multicall3] = [Sign.aggregate3],
        _a),
    arbitrum: (_b = {},
        _b[Address.AaveFlashLiquidator_ARBITRUM] = [Sign.flashLiquidate],
        _b[Address.TREASURY_MANAGER] = [Sign.claimVaultRewardTokens, Sign.reinvestVaultReward, Sign.harvestAssetsFromNotional, Sign.executeTrade],
        _b[Address.AaveV3Pool_ARBITRUM] = [Sign.flashLoan],
        _b[Address.Multicall3] = [Sign.aggregate3],
        _b[Address.initializeAllMarkets_ARBITRUM] = [Sign.initializeAllMarkets],
        _b[Address.settleAccounts_ARBITRUM] = [Sign.settleAccounts, Sign.settleVaultsAccounts],
        _b),
    sepolia: (_c = {},
        _c[Address.AaveFlashLiquidator_ARBITRUM] = [Sign.flashLiquidate],
        _c[Address.TREASURY_MANAGER] = [Sign.claimVaultRewardTokens, Sign.reinvestVaultReward],
        _c[Address.AaveV3Pool_ARBITRUM] = [Sign.flashLoan],
        _c[Address.Multicall3] = [Sign.aggregate3],
        _c[Address.initializeAllMarkets_ARBITRUM] = [Sign.initializeAllMarkets],
        _c[Address.settleAccounts_ARBITRUM] = [Sign.settleAccounts, Sign.settleVaultsAccounts],
        _c)
};
var keysToUse = (_d = {},
    _d[Address.TREASURY_MANAGER] = Key.reinvestment,
    _d[Address.AaveV3Pool_ARBITRUM] = Key.liquidation,
    _d[Address.AaveV3Pool_MAINNET] = Key.liquidation,
    _d[Address.AaveFlashLiquidator_ARBITRUM] = Key.liquidation,
    _d[Address.AaveFlashLiquidator_MAINNET] = Key.liquidation,
    _d[Address.Multicall3] = Key.liquidation,
    _d[Address.initializeAllMarkets_ARBITRUM] = Key.liquidation,
    _d[Address.settleAccounts_ARBITRUM] = Key.liquidation,
    _d);
function getTxType(_a) {
    var signature = _a.signature;
    if ([Sign.flashLoan, Sign.flashLiquidate, Sign.settleVaultsAccounts, Sign.settleAccounts, Sign.initializeAllMarkets].includes(signature)) {
        return 'liquidation';
    }
    if ([Sign.claimVaultRewardTokens, Sign.reinvestVaultReward].includes(signature)) {
        return 'reinvestment';
    }
    if ([Sign.executeTrade, Sign.investWETHAndNOTE].includes(signature)) {
        return 'burnNote';
    }
    if ([Sign.harvestAssetsFromNotional].includes(signature)) {
        return 'harvesting';
    }
    if ([Sign.settleVaultsAccounts, Sign.settleAccounts, Sign.initializeAllMarkets].includes(signature)) {
        return 'initialize-markets';
    }
    return 'unknown';
}
function logToDataDog(message) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            return [2 /*return*/, fetch("https://http-intake.logs.datadoghq.com/api/v2/logs", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                        'DD-API-KEY': process.env.DD_API_KEY
                    },
                    body: JSON.stringify({
                        ddsource: "tx-relay",
                        service: "signer",
                        message: message
                    })
                }).catch(function (err) { return console.error(err); })];
        });
    });
}
var wait = function (ms) { return new Promise(function (r) { return setTimeout(r, ms); }); };
// will only work properly if node app is not run in cluster
var throttle = (function () {
    var delay = 2000;
    var lastCallPerDomain = new Map();
    return function (domain) { return tslib_1.__awaiter(void 0, void 0, void 0, function () {
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!(Date.now() < (lastCallPerDomain.get(domain) || 0) + delay)) return [3 /*break*/, 2];
                    return [4 /*yield*/, wait(delay - (Date.now() - (lastCallPerDomain.get(domain) || 0)))];
                case 1:
                    _a.sent();
                    return [3 /*break*/, 0];
                case 2:
                    lastCallPerDomain.set(domain, Date.now());
                    return [2 /*return*/];
            }
        });
    }); };
})();
function sendTransaction(_a) {
    var _b, _c;
    var to = _a.to, data = _a.data, gasLimit = _a.gasLimit, network = _a.network;
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var signature, provider, signer, transaction, sharedLogData, txResponse, retry, err_1, err_2;
        var _d;
        return tslib_1.__generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    to = to.toLowerCase();
                    signature = data.slice(0, 10);
                    if (!whitelist[network][to] ||
                        !whitelist[network][to].includes(signature)) {
                        throw new Error("Call to: ".concat(to, " method: ").concat(signature, " on network: ").concat(network, " is not allowed"));
                    }
                    // in order to properly fetch correct nonce for tx we need to throttle here per key
                    return [4 /*yield*/, throttle(keysToUse[to])];
                case 1:
                    // in order to properly fetch correct nonce for tx we need to throttle here per key
                    _e.sent();
                    provider = ethers_1.ethers.getDefaultProvider(rpcUrls[network]);
                    signer = new ethers_gcp_kms_signer_1.GcpKmsSigner(tslib_1.__assign(tslib_1.__assign({}, kmsCredentials), { keyId: keysToUse[to] })).connect(provider);
                    transaction = {
                        to: to,
                        data: data,
                        gasLimit: Number.isInteger(Number(gasLimit)) ? gasLimit : undefined,
                    };
                    _d = {
                        txType: getTxType({ signature: signature }),
                        signature: signature,
                        network: network,
                        to: to
                    };
                    return [4 /*yield*/, signer.getAddress()];
                case 2:
                    sharedLogData = (_d.from = _e.sent(),
                        _d);
                    retry = 0;
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 5, , 13]);
                    return [4 /*yield*/, signer.sendTransaction(transaction)];
                case 4:
                    // first attempt
                    txResponse = _e.sent();
                    return [3 /*break*/, 13];
                case 5:
                    err_1 = _e.sent();
                    return [4 /*yield*/, logToDataDog(tslib_1.__assign(tslib_1.__assign({}, sharedLogData), { retry: retry, err: JSON.stringify(err_1), status: 'fail' }))];
                case 6:
                    _e.sent();
                    _e.label = 7;
                case 7:
                    _e.trys.push([7, 10, , 12]);
                    retry++;
                    // second attempt, in case nonce was stale
                    return [4 /*yield*/, wait(1000)];
                case 8:
                    // second attempt, in case nonce was stale
                    _e.sent();
                    return [4 /*yield*/, signer.sendTransaction(transaction)];
                case 9:
                    txResponse = _e.sent();
                    return [3 /*break*/, 12];
                case 10:
                    err_2 = _e.sent();
                    return [4 /*yield*/, logToDataDog(tslib_1.__assign(tslib_1.__assign({}, sharedLogData), { retry: retry, err: JSON.stringify(err_2), status: 'fail' }))];
                case 11:
                    _e.sent();
                    throw err_2;
                case 12: return [3 /*break*/, 13];
                case 13: return [4 /*yield*/, logToDataDog(tslib_1.__assign(tslib_1.__assign({}, sharedLogData), { hash: txResponse.hash, gasLimit: (_b = txResponse.gasLimit) === null || _b === void 0 ? void 0 : _b.toString(), gasPrice: (_c = txResponse.gasPrice) === null || _c === void 0 ? void 0 : _c.toString(), status: 'success', retry: retry }))];
                case 14:
                    _e.sent();
                    return [2 /*return*/, txResponse];
            }
        });
    });
}
exports.sendTransaction = sendTransaction;
function getAllSignerAddresses() {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var _a, _b;
        var _c;
        return tslib_1.__generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _c = {};
                    _a = Key.reinvestment;
                    return [4 /*yield*/, (new ethers_gcp_kms_signer_1.GcpKmsSigner(tslib_1.__assign(tslib_1.__assign({}, kmsCredentials), { keyId: Key.reinvestment }))).getAddress()];
                case 1:
                    _c[_a] = _d.sent();
                    _b = Key.liquidation;
                    return [4 /*yield*/, (new ethers_gcp_kms_signer_1.GcpKmsSigner(tslib_1.__assign(tslib_1.__assign({}, kmsCredentials), { keyId: Key.liquidation }))).getAddress()];
                case 2: return [2 /*return*/, (_c[_b] = _d.sent(),
                        _c)];
            }
        });
    });
}
exports.getAllSignerAddresses = getAllSignerAddresses;
//# sourceMappingURL=Signer.js.map