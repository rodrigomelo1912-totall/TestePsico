function usageSince(period, now = new Date()) {
  if (period === "all") return null;
  const days = Number(period);
  if (![7, 30, 90].includes(days)) return new Date(now.getTime() - 30 * 86400000).toISOString();
  return new Date(now.getTime() - days * 86400000).toISOString();
}

function usageCount(value) {
  if (value === null || value === undefined || value === "") return "—";
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 ? new Intl.NumberFormat("pt-BR").format(number) : "—";
}

function usageBars(days) {
  const rows = Array.isArray(days) ? days : [];
  const maximum = Math.max(0, ...rows.map(row => Number(row.tokens) || 0));
  return rows.map(row => ({
    day: String(row.day || ""),
    tokens: Math.max(0, Number(row.tokens) || 0),
    requests: Math.max(0, Number(row.requests) || 0),
    height: maximum && Number(row.tokens) > 0 ? Math.max(4, Math.round(100 * Number(row.tokens) / maximum)) : 0
  }));
}
