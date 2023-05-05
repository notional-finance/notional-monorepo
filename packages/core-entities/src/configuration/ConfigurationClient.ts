import { ClientRegistry } from '../registry/ClientRegistry';
import { AllConfigurationQuery } from '../.graphclient';

export class ConfigurationClient extends ClientRegistry<AllConfigurationQuery> {
  protected cachePath = 'configuration';

  // TODO: implement getters as required for convenience
}
