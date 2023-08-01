# Backfill

To run the backfill job replace the `blockRange` and `network` variables in the `main.ts` file with the range to run the backfill over. It will produce two files: `yields.json` and `oracles.json` in the root of this directory.

To run the backfill: `yarn nx run-script backfill`