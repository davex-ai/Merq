import Fastify from "fastify";
import { proxyOpenAI } from "./proxy/openai.js";

const app = Fastify({ logger: true });

app.post("/proxy/openai/*", proxyOpenAI);

app.listen({ port: 3000 }, () => {
  console.log("API Cost Monitor running on http://localhost:3000");
});