import { Network, ZERO_ADDRESS } from '@notional-finance/util';
import { Registry, AccountFetchMode } from '../../src';

describe.withRegistry(
  {
    network: Network.ArbitrumOne,
    fetchMode: AccountFetchMode.SINGLE_ACCOUNT_DIRECT,
  },
  'Snapshot',
  () => {
    it('[Configuration]', (done) => {
      const config = Registry.getConfigurationRegistry();
      config.onSubjectKeyReady(Network.ArbitrumOne, Network.ArbitrumOne, () => {
        expect(
          config.getLatestFromAllSubjects(Network.ArbitrumOne)
        ).toMatchSnapshot();
        done();
      });
    });

    // No exchanges listed yet
    it('[Exchanges]', (done) => {
      const exchanges = Registry.getExchangeRegistry();
      exchanges.onSubjectKeyReady(
        Network.ArbitrumOne,
        '0x06D45ef1f8b3C37b0de66f156B11F10b4837619A',
        () => {
          expect(
            exchanges.getLatestFromAllSubjects(Network.ArbitrumOne)
          ).toMatchSnapshot();
          done();
        }
      );
    });

    it('[Tokens]', (done) => {
      const config = Registry.getTokenRegistry();
      config.onSubjectKeyReady(Network.ArbitrumOne, ZERO_ADDRESS, () => {
        expect(
          config.getLatestFromAllSubjects(Network.ArbitrumOne)
        ).toMatchSnapshot();
        done();
      });
    });

    it('[Oracles]', (done) => {
      const config = Registry.getOracleRegistry();
      config.onSubjectKeyReady(
        Network.ArbitrumOne,
        '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8:0xc3882b132011ff3cea4da81f3303138368dd5d75:PrimeDebtToUnderlyingExchangeRate',
        () => {
          expect(
            config.getLatestFromAllSubjects(Network.ArbitrumOne, 0)
          ).toMatchSnapshot();
          done();
        }
      );
    });

    it('[Vaults]', (done) => {
      const vaults = Registry.getVaultRegistry();
      vaults.onSubjectKeyReady(
        Network.ArbitrumOne,
        '0xae38f4b960f44d86e798f36a374a1ac3f2d859fa',
        () => {
          expect(
            vaults.getLatestFromAllSubjects(Network.ArbitrumOne, 0)
          ).toMatchSnapshot();
          done();
        }
      );
    });

    it('[All Tokens]', (done) => {
      const tokens = Registry.getTokenRegistry();
      tokens.onSubjectKeyReady(Network.All, 'ETH', () => {
        expect(tokens.getLatestFromAllSubjects(Network.All)).toMatchSnapshot();
        done();
      });
    });

    it('[All Oracles]', (done) => {
      const oracles = Registry.getOracleRegistry();
      oracles.onSubjectKeyReady(Network.All, 'ETH:USD:Chainlink', () => {
        console.log(oracles.getLatestFromAllSubjects(Network.All));
        expect(oracles.getLatestFromAllSubjects(Network.All)).toMatchSnapshot();
        done();
      });
    });
  }
);
