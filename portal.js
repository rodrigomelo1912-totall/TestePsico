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
  return { config, client, submitToken, signIn, signUp, signOut, session };
})();
