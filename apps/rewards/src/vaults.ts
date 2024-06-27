import { Network } from '@notional-finance/util';

// all addresses must be properly checksummed
// mainnet
const WETH = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
const rETH = '0xae78736Cd615f374D3085123A210448E74Fc6393';
const PYUSD = '0x6c3ea9036406852006290770BEdFcAbA0e23A0e8';
const USDC = '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48';
const USDT = '0xdAC17F958D2ee523a2206206994597C13D831ec7';
const crvUSD = '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E'
const GHO = '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f';
const CRV = '0xD533a949740bb3306d119CC777fa900bA034cd52';
const CVX = '0x4e3FBD56CD56c3e72c1403e103b45Db9da5B9D2B';
const BAL = '0xba100000625a3754423978a60c9317c58a424e3D';
const AURA = '0xC0c293ce456fF0ED870ADd98a0828Dd4d2903DBF';
const ezETH = '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110';
const weETH = '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee';
// arbitrum
const ARB_WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';
const ARB_BAL = '0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8';
const ARB_AURA = '0x1509706a6c66CA549ff0cB464de88231DDBe213B';
const ARB_CRV = '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978';
const ARB = '0x912CE59144191C1204E64559FE8253a0e49E6548';
const ARB_RETH = '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8';
const ARB_FRAX = '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F';
const ARB_USDCe = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8';
const ARB_USDC = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
const ARB_DAI = '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1';
const ARB_USDT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';
const ARB_wstETH = '0x5979D7b546E38E414F7E9822514be443A4800529';
const ARB_cbETH = '0x1DEBd73E752bEaF79865Fd6446b0c970EaE7732f';
const ARB_crvUSD = '0x498Bf2B1e120FeD3ad3D42EA2165E9b73f99C1e5';
const ARB_WBTC = '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f';
const ARB_tBTC = '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40';
const ARB_ezETH = '0x2416092f143378750bb29b79eD961ab195CcEea5';

export const ETH = '0x0000000000000000000000000000000000000000';

export const wEthMapper: Partial<Record<Network, string>> = {
  mainnet: WETH,
  arbitrum: ARB_WETH
}

// set minimum values for tokens that are going to be claim/sell (~$15 for arbitrum, ~$150 for mainnet)
// if token is also pool token it won't be sold
export const minTokenAmount = {
  [PYUSD]: "150000000", // 150e6
  [CRV]: "230000000000000000000", // 230e18
  [CVX]: "40000000000000000000", // 40e18
  [BAL]: "30000000000000000000", // 30e18
  [AURA]: "200000000000000000000", // 200e18
  [ARB]: "7000000000000000000", // 7e18
  [ARB_BAL]: "3500000000000000000", // 3.5e18
  [ARB_AURA]: "21000000000000000000", // 21e18
  [ARB_CRV]: "30000000000000000000", // 10e18
};

export type Vault = {
  address: string;
  rewardTokens: Array<string>,
  poolTokens: Array<string>,
  tokenWeights: Array<number>,
  maxSellAmount?: Record<string, string>
}
// tokens in the pool need to be in the same order as they are stored in the vault
// whatever TOKENS() method on vault returns
// token weight for Balancer pool token should be set to 0
export const vaults: Partial<Record<Network, Array<Vault>>> = {
  mainnet: [
    {
      address: '0x84e58d8faA4e3B74d55D9fc762230f15d95570B8',
      rewardTokens: [CRV, CVX, PYUSD],
      poolTokens: [PYUSD, USDC],
      tokenWeights: [50, 50],
    },
    {
      address: '0xba4eb30f7F2e378249cf94E08F581e704326e9c6',
      rewardTokens: [CRV, CVX],
      poolTokens: [USDC, crvUSD],
      tokenWeights: [50, 50],
    },
    {
      address: '0x86B222d44AC6cC56e75b3df01fdAD5Dc371EF538',
      rewardTokens: [CRV, CVX],
      poolTokens: [USDT, crvUSD],
      tokenWeights: [50, 50],
    },
    {
      address: '0xeEB885Af7C8075Aa3b93e2F95E1c0bD51c758F91',
      rewardTokens: [BAL, AURA],
      poolTokens: [GHO, '0x8353157092ED8Be69a9DF8F95af097bbF33Cb2aF', USDC, USDT],
      tokenWeights: [33, 0, 33, 33],
    },
    {
      address: '0x914255c0c289AEa36E378EBB5e28293b5ED278Ca',
      rewardTokens: [BAL, AURA],
      poolTokens: ['0x596192bB6e41802428Ac943D2f1476C1Af25CC0E', ezETH, ETH],
      tokenWeights: [0, 50, 50],
    },
    {
      address: '0x32D82A1C8618c7Be7Fe85B2F1C44357A871d52D1',
      rewardTokens: [BAL, AURA],
      poolTokens: ['0x05ff47AFADa98a98982113758878F9A8B9FddA0a', rETH, weETH],
      tokenWeights: [0, 50, 50],
    },
    {
      address: '0x30fBa4a7ec8591f25B4D37fD79943a4bb6E553e2',
      rewardTokens: [CRV, CVX],
      poolTokens: [GHO, crvUSD],
      tokenWeights: [50, 50],
    },
  ],
  arbitrum: [
    {
      address: '0xdb08f663e5D765949054785F2eD1b2aa1e9C22Cf',
      rewardTokens: [ARB_CRV, ARB],
      poolTokens: [ARB_FRAX, ARB_USDCe],
      tokenWeights: [50, 50],
    },
    {
      address: '0x431dbfE3050eA39abBfF3E0d86109FB5BafA28fD',
      rewardTokens: [ARB_CRV, ARB],
      poolTokens: [ARB_USDCe, ARB_USDT],
      tokenWeights: [50, 50],
    },
    {
      address: '0x5c36a0DeaB3531d29d848E684E8bDf5F81cDB643',
      rewardTokens: [ARB_CRV, ARB],
      poolTokens: [ARB_crvUSD, ARB_USDC],
      tokenWeights: [0, 100],
    },
    {
      address: '0xae04e4887cBf5f25c05aC1384BcD0b7e885a1F4A',
      rewardTokens: [ARB_CRV, ARB],
      poolTokens: [ARB_crvUSD, ARB_USDT],
      tokenWeights: [0, 100],
    },
    {
      address: '0xF95441f348eb2fd3D5D82f9B7B961137a734eEdD',
      rewardTokens: [ARB_CRV, ARB],
      poolTokens: [ARB_WBTC, ARB_tBTC],
      tokenWeights: [50, 50],
    },
    {
      address: '0x3Df035433cFACE65b6D68b77CC916085d020C8B8',
      rewardTokens: [ARB, ARB_BAL, ARB_AURA],
      poolTokens: [ETH, '0xadE4A71BB62bEc25154CFc7e6ff49A513B491E81', ARB_RETH],
      tokenWeights: [50, 0, 50],
    },
    {
      address: '0x8Ae7A8789A81A43566d0ee70264252c0DB826940',
      rewardTokens: [ARB, ARB_BAL, ARB_AURA],
      poolTokens: ['0x423A1323c871aBC9d89EB06855bF5347048Fc4A5', ARB_USDC, ARB_DAI, ARB_USDT, ARB_USDCe],
      tokenWeights: [0, 25, 25, 25, 25],
    },
    {
      address: '0x0E8C1A069f40D0E8Fa861239D3e62003cBF3dCB2',
      rewardTokens: [ARB],
      poolTokens: [ARB_wstETH, ETH, '0x9791d590788598535278552EEcD4b211bFc790CB'],
      tokenWeights: [50, 50, 0],
      maxSellAmount: {
        [ARB]: "384600000000000000000", // 384.6e18
      }
    },
    {
      address: '0x37dD23Ab1885982F789A2D6400B583B8aE09223d',
      rewardTokens: [ARB, ARB_BAL, ARB_AURA],
      poolTokens: [ARB_cbETH, '0x4a2F6Ae7F3e5D715689530873ec35593Dc28951B', ARB_wstETH, ARB_RETH],
      tokenWeights: [33, 0, 33, 33],
    },
    {
      address: '0xD7c3Dc1C36d19cF4e8cea4eA143a2f4458Dd1937',
      rewardTokens: [ARB, ARB_BAL, ARB_AURA],
      poolTokens: [ARB_ezETH, ARB_wstETH, '0xB61371Ab661B1ACec81C699854D2f911070C059E'],
      tokenWeights: [50, 50, 0],
    },
  ],
};;
