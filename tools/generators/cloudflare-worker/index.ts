import {
  Tree,
  formatFiles,
  installPackagesTask,
  generateFiles,
  joinPathFragments,
  updateJson,
} from '@nx/devkit';

interface NewCloudflareWorker {
  name: string;
}

export default async function (host: Tree, schema: NewCloudflareWorker) {
  generateFiles(
    host,
    joinPathFragments(__dirname, './files'),
    `./apps/${schema.name}`,
    {
      name: schema.name,
    }
  );
  await formatFiles(host);
  return () => {
    installPackagesTask(host);
  };
}
