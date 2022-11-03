import {
  Tree,
  formatFiles,
  installPackagesTask,
  generateFiles,
  joinPathFragments,
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
  await formatFiles(host);
  // return () => {
  //   installPackagesTask(host);
  // };
}
