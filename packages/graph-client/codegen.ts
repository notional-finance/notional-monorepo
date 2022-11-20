import type { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: './schemas/**/*.graphql',
  documents: ['queries/**/*.ts'],
  generates: {
    './queries/gql/': {
      preset: 'client',
      plugins: [],
    },
  },
};
export default config;
