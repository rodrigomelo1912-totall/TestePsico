const ProfilePortal = (() => {
  const config = window.PROFILE_PORTAL_CONFIG || {};
  const client = config.enabled && window.supabase ? window.supabase.createClient(config.url, config.publishableKey) : null;

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
      headers: { "Content-Type": "application/json", apikey: config.publishableKey },
      body: JSON.stringify({ action, code: code.trim().toUpperCase(), ...(html ? { html } : {}) })
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload.ok) throw new Error(payload.message || "A análise complementar não ficou disponível.");
    return payload;
  }

  async function enrichToken(code) { return (await callPersonalization("generate", code)).reading; }
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
  return { config, client, submitToken, enrichToken, archiveReport, signIn, signUp, signOut, session };
})();
