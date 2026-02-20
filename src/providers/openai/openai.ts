import type { FastifyRequest, FastifyReply } from "fastify";
import { calculateCost } from "./pricing.js";
import { logUsage } from "../../store/usage.js";

export async function proxyOpenAI(
  req: FastifyRequest,
  reply: FastifyReply
) {
  const path = req.url.replace("/proxy/openai", "");
  const openaiUrl = `https://api.openai.com${path}`;

  const res = await fetch(openaiUrl, {
    method: req.method,
    headers: {
      "Authorization": req.headers.authorization!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(req.body),
  });

  const data = await res.json();

  const usage = data.usage;
  if (usage) {
    const cost = calculateCost("gpt-4o-mini", usage);
    logUsage({
      model: "gpt-4o-mini",
      tokens: usage.total_tokens,
      cost,
      timestamp: Date.now(),
    });
  }

  reply.status(res.status).send(data);
}