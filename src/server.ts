//server.ts
import Fastify from "fastify";
import { handleProviderRequest } from "./providers/index.js";

const app = Fastify({ logger: true });

app.post("/merq/:provider/*", async (req, reply) => {
  const { provider } = req.params as { provider: string };
  await handleProviderRequest(provider, req, reply);
});

app.listen({ port: 3000 }, () => {
  console.log("Merq API Cost Monitor running on http://localhost:3000");
});