const ARB_BAL = '0x040d1EdC9569d4Bab2D15287Dc5A4F10F56a56B8';
const ARB_AURA = '0x1509706a6c66CA549ff0cB464de88231DDBe213B';
const ARB_CRV = '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978';
const ARB = '0x912CE59144191C1204E64559FE8253a0e49E6548';
const ARB_RETH = '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8';
const ARB_FRAX = '0x17FC002b466eEc40DaE837Fc4bE5c67993ddBd6F';
const ARB_USDCe = '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8';
const ARB_USDC =  '0xaf88d065e77c8cC2239327C5EDb3A432268e5831';
const ARB_DAI = '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1';
const ARB_USDT = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9';

export const ARB_WETH = '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1';

// tokens in the pool need to be in the same order as they are stored in the vault
// whatever TOKENS() method on vault returns
// token weight for Balancer pool token should be set to 0
export const vaults = [
  {
    address: '0xdb08f663e5D765949054785F2eD1b2aa1e9C22Cf',
    rewardTokens: [ARB_CRV, ARB],
    poolTokens: [ARB_FRAX, ARB_USDCe],
    tokenWeights: [50, 50],
  },
  {
    address: '0x3Df035433cFACE65b6D68b77CC916085d020C8B8',
    rewardTokens: [ARB, ARB_BAL, ARB_AURA],
    poolTokens: [ARB_WETH, '0xadE4A71BB62bEc25154CFc7e6ff49A513B491E81', ARB_RETH],
    tokenWeights: [50, 0, 50],
  },
  {
    address: '0x8Ae7A8789A81A43566d0ee70264252c0DB826940',
    rewardTokens: [ARB, ARB_BAL, ARB_AURA],
    poolTokens: ['0x423A1323c871aBC9d89EB06855bF5347048Fc4A5', ARB_USDC, ARB_DAI, ARB_USDT, ARB_USDCe],
    tokenWeights: [0, 25, 25, 25, 25],
  },
];
