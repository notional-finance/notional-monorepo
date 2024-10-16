import { Network } from '@notional-finance/util';
import { NetworkServerModel } from '../src/models/NetworkModel';

const NX_SUBGRAPH_API_KEY = process.env['NX_SUBGRAPH_API_KEY'] as string;

describe('NetworkServerModel', () => {
  it('should create a mainnet network and save storage to snapshot', async () => {
    const mainnetNetwork = NetworkServerModel.create({
      network: Network.mainnet,
    });

    let savedData = '';
    mainnetNetwork.initialize(
      async (data: string) => {
        savedData = data;
      },
      {
        NX_SUBGRAPH_API_KEY,
      }
    );

    await mainnetNetwork.refresh(true);

    expect(savedData).toMatchSnapshot();
  }, 30000); // Increased timeout to 30 seconds
});
