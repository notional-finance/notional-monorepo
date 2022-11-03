import {
  Tree,
  formatFiles,
  installPackagesTask,
  generateFiles,
  joinPathFragments,
  updateJson,
} from '@nrwl/devkit';

interface NewCloudflareWorker {
  name: string;
}

export default async function (host: Tree, schema: NewCloudflareWorker) {
  generateFiles(
    host,
    joinPathFragments(__dirname, './files'),
    `./services/${schema.name}`,
    {
      name: schema.name,
    }
  );
  updateJson(host, 'workspace.json', (pkgJson) => {
    // if scripts is undefined, set it to an empty object
    pkgJson.projects = pkgJson.projects ?? {};
    // add greet script
    pkgJson.projects[schema.name] = `services/${schema.name}`;
    // return modified JSON object
    return pkgJson;
  });
  await formatFiles(host);
  return () => {
    installPackagesTask(host);
  };
}
