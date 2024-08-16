import { Registry, AccountFetchMode } from '../src';
import { AccountModel } from '../src/models/AccountModel';
import { Network } from '@notional-finance/util';

describe('AccountModel', () => {
  beforeAll(async () => {
    Registry.initialize(
      {
        NX_SUBGRAPH_API_KEY: 'test',
      },
      'https://registry.notional.finance',
      AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
      false,
      false,
      true
    );

    await Registry.triggerRefresh(Network.mainnet);
  });

  it('creates an account model with required fields and matches snapshot', () => {
    const account = AccountModel.create({
      address: '0xd74e7325dFab7D7D1ecbf22e6E6874061C50f243',
      network: Network.mainnet,
    });

    expect(account).toMatchSnapshot();
  });
});
