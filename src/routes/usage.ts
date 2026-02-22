import type { FastifyInstance } from "fastify";
import { getDailyUsage } from "../store/daily.js";

export async function usuageRoute(app:FastifyInstance) {
    app.get("usage/daily/:apiKeyId", async (req) => {
        const { apiKeyId } = req.params as { apiKeyId: string}
        const { date }  = req.params as { date?: string}

        return getDailyUsage(apiKeyId, date)
    })
}