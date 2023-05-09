import { ClientRegistry } from '../registry/client-registry';
import { Routes } from '../server';
import { AllConfigurationQuery } from '../server/configuration-server';

export class ConfigurationClient extends ClientRegistry<AllConfigurationQuery> {
  protected cachePath = Routes.Configuration;

  // TODO: implement getters as required for convenience
}
