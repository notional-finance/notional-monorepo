# Backfill

To run the backfill job replace the `blockRange` and `network` variables in the `main.ts` file with the range to run the backfill over. It will produce two files: `yields.json` and `oracles.json` in the root of this directory.

To run the backfill: `yarn nx serve backfill`

I have not found a way to have nx run the backfill as a single script so it "serves" the script as a long running process. Once the script says that it is "DONE" you can kill the job.