const ProfilePortal = (() => {
  const config = window.PROFILE_PORTAL_CONFIG || {};
  const client = config.enabled && window.supabase ? window.supabase.createClient(config.url, config.publishableKey) : null;
  let aiReady = false;

  async function submitToken(code, payload) {
    if (!client) throw new Error("O serviço de tokens ainda não está configurado.");
    const { data, error } = await client.rpc("redeem_profile_token", { p_code: code.trim().toUpperCase(), p_submission: payload });
    if (error) throw error;
    if (!data?.ok) throw new Error(data?.message || "Token indisponível.");
    return data;
  }

  async function callPersonalization(action, code, html) {
    if (!client || !config.aiEnabled) throw new Error("A personalização por IA não está ativa.");
    const response = await fetch(`${config.url}/functions/v1/personalize-report`, {
      method: "POST",
      signal: AbortSignal.timeout(action === "generate" ? 145000 : 30000),
      headers: { "Content-Type": "application/json", apikey: config.publishableKey },
      body: JSON.stringify({ action, code: code.trim().toUpperCase(), ...(html ? { html } : {}) })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) throw new Error(payload.message || "A análise complementar não ficou disponível.");
    return payload;
  }

  async function checkAiAvailability() {
    aiReady = false;
    if (!client || !config.aiEnabled) return false;
    try {
      const response = await fetch(`${config.url}/functions/v1/personalize-report`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: config.publishableKey },
        body: JSON.stringify({ action: "status" })
      });
      const payload = await response.json();
      aiReady = response.ok && payload.ok && payload.aiEnabled === true;
    } catch { aiReady = false; }
    return aiReady;
  }

  async function enrichToken(code) { return callPersonalization("generate", code); }
  async function archiveReport(code, html) { return callPersonalization("archive", code, html); }

  async function signIn(email, password) {
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signUp(email, password) {
    const { data, error } = await client.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() { await client?.auth.signOut(); }
  async function session() { return client ? (await client.auth.getSession()).data.session : null; }
  return { config, client, submitToken, enrichToken, archiveReport, checkAiAvailability, get aiReady() { return aiReady; }, signIn, signUp, signOut, session };
})();
