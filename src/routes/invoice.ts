// routes/invoice.ts
import { pool } from "../constants.js";

export async function invoiceJsonRoute(app: any) {
  app.get("/invoice/:apiKeyId/:month", async (req: any) => {
    const { apiKeyId, month } = req.params;

    const res = await pool.query(
      `
      SELECT
        provider,
        model,
        SUM(total_tokens) AS tokens,
        SUM(cost_usd) AS cost
      FROM usage_events
      WHERE api_key_id = $1
        AND date_trunc('month', created_at) = $2::date
      GROUP BY provider, model
      ORDER BY cost DESC
      `,
      [apiKeyId, `${month}-01`]
    );

    return {
      apiKeyId,
      month,
      totalCost: res.rows.reduce((s, r) => s + Number(r.cost), 0),
      lineItems: res.rows,
    };
  });
}

export async function invoiceCsvRoute(app: any) {
  app.get("/invoice/:apiKeyId/:month.csv", async (req: any, reply: any) => {
    const { apiKeyId, month } = req.params;

    const res = await pool.query(
      `
      SELECT
        provider,
        model,
        SUM(total_tokens) AS tokens,
        SUM(cost_usd) AS cost
      FROM usage_events
      WHERE api_key_id = $1
        AND date_trunc('month', created_at) = $2::date
      GROUP BY provider, model
      `,
      [apiKeyId, `${month}-01`]
    );

    let csv = "provider,model,tokens,cost_usd\n";
    for (const row of res.rows) {
      csv += `${row.provider},${row.model},${row.tokens},${row.cost}\n`;
    }

    reply
      .header("Content-Type", "text/csv")
      .header(
        "Content-Disposition",
        `attachment; filename=invoice-${month}.csv`
      )
      .send(csv);
  });
}