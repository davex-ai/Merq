import type { FastifyInstance } from "fastify";
import { getMonthlyUsage, getDailyUsage} from "../store/usage.js";

export async function dailyUsageRoute(app:FastifyInstance) {
    app.get("/usage/daily/:apiKeyId", async (req) => {
        const { apiKeyId } = req.params as { apiKeyId: string}
        const { date }  = req.params as { date?: string}

        return getDailyUsage(apiKeyId, date)
    })
}

export async function monthlyUsageRoute(app:FastifyInstance) {
    app.get("/usage/monthly/:apiKeyId", async (req) => {
        const { apiKeyId } = req.params as { apiKeyId: string}
        const { date }  = req.params as { date?: string}

        return getMonthlyUsage(apiKeyId, date)
    })
}