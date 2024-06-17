import express from "express";
import { sendTransaction, getAllSignerAddresses } from "./Signer";
import { Network } from "./types";
import { getEnvSecrets } from 'gae-env-secrets';

const DEFAULT_SERVICE_PORT = "8000";

export async function main() {
  await getEnvSecrets({ autoDetect: true });
  if (!process.env.AUTH_TOKEN) {
    throw Error("AUTH_TOKEN not defined");
  }

  const app = express();
  const port = parseInt(process.env.SERVICE_PORT || DEFAULT_SERVICE_PORT);

  app.use(express.json());

  app.get("/", (_, res) => {
    res.send("OK");
  });

  app.get("/v1/signers", async (req, res) => {
    if (req.headers["x-auth-token"] !== process.env.AUTH_TOKEN) {
      res.status(401).send("Unauthorized");
      return;
    }

    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify(await getAllSignerAddresses()));
  });

  app.post("/v1/txes/:network", async (req, res) => {
    if (req.headers["x-auth-token"] !== process.env.AUTH_TOKEN) {
      res.status(401).send("Unauthorized");
      return;
    }

    const network: Network = req.params["network"] as Network;

    try {
      const result = await sendTransaction({
          to: req.body["to"],
          data: req.body["data"],
          gasLimit: Number(req.body["gasLimit"]),
          network,
        });
      res.status(200).send(JSON.stringify(result));
    } catch (e) {
      console.log(e);
      res.status(500).send(JSON.stringify(e));
    }
  });

  app.listen(port, () => {
    console.log(`Listening on port ${port}`);
  });
}

if (require.main === module) {
  require("dotenv").config();
  main();
}
