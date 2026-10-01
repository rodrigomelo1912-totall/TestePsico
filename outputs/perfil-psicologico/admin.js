const adminClient = ProfilePortal.client;
const admin$ = id => document.getElementById(id);
const escapeAdmin = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);

async function sha256(value) {
  const buffer = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(buffer)].map(byte => byte.toString(16).padStart(2, "0")).join("");
}

function makeToken() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const groups = Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("").match(/.{1,4}/g);
  return `VRM-${groups.join("-")}`;
}

function status(message, type = "") {
  admin$("admin-status").textContent = message;
  admin$("admin-status").className = `admin-status ${type}`;
}

async function loadDashboard() {
  const [{ data: tokens, error: tokenError }, { data: submissions, error: submissionError }] = await Promise.all([
    adminClient.from("profile_tokens").select("id,code_hint,status,created_at,used_at").order("created_at", { ascending: false }),
    adminClient.from("profile_submissions").select("id,name,email,phone,company,job_title,submitted_at,profile_tokens(code_hint)").order("submitted_at", { ascending: false })
  ]);
  if (tokenError || submissionError) throw tokenError || submissionError;
  admin$("token-list").innerHTML = tokens.length ? tokens.map(token => `<tr><td>${escapeAdmin(token.code_hint)}</td><td><span class="token-status ${escapeAdmin(token.status)}">${escapeAdmin(token.status)}</span></td><td>${new Date(token.created_at).toLocaleDateString("pt-BR")}</td><td>${token.used_at ? new Date(token.used_at).toLocaleDateString("pt-BR") : "—"}</td><td>${token.status === "active" ? `<button type="button" class="text-button" data-revoke="${token.id}">Revogar</button>` : ""}</td></tr>`).join("") : "<tr><td colspan=5>Nenhum token gerado.</td></tr>";
  admin$("submission-list").innerHTML = submissions.length ? submissions.map(item => `<tr><td><strong>${escapeAdmin(item.name)}</strong><small>${escapeAdmin(item.email)}</small></td><td>${escapeAdmin(item.phone)}</td><td>${escapeAdmin(item.company)}</td><td>${escapeAdmin(item.job_title)}</td><td>${escapeAdmin(item.profile_tokens?.code_hint || "—")}</td><td>${new Date(item.submitted_at).toLocaleString("pt-BR")}</td></tr>`).join("") : "<tr><td colspan=6>Nenhum laudo liberado ainda.</td></tr>";
}

async function showDashboard() {
  admin$("admin-login").hidden = true;
  admin$("admin-dashboard").hidden = false;
  await loadDashboard();
}

admin$("admin-login-form").addEventListener("submit", async event => {
  event.preventDefault();
  try { await ProfilePortal.signIn(admin$("admin-email").value.trim(), admin$("admin-password").value); await showDashboard(); }
  catch (error) { status(error.message || "Não foi possível entrar.", "error"); }
});

admin$("admin-create-access").addEventListener("click", async () => {
  try { await ProfilePortal.signUp(admin$("admin-email").value.trim(), admin$("admin-password").value); status("Acesso criado. Confirme o e-mail, se solicitado pelo Supabase, e entre novamente.", "success"); }
  catch (error) { status(error.message || "Não foi possível criar o acesso.", "error"); }
});

admin$("new-token").addEventListener("click", async () => {
  const code = makeToken();
  try {
    const { error } = await adminClient.from("profile_tokens").insert({ code_hash: await sha256(code), code_hint: code.slice(-4) });
    if (error) throw error;
    admin$("generated-token").textContent = code;
    admin$("generated-token").hidden = false;
    await loadDashboard();
  } catch (error) { status(error.message || "Não foi possível gerar o token.", "error"); }
});

admin$("copy-token").addEventListener("click", async () => { await navigator.clipboard.writeText(admin$("generated-token").textContent); status("Token copiado.", "success"); });
admin$("token-list").addEventListener("click", async event => {
  const id = event.target.dataset.revoke;
  if (!id) return;
  const { error } = await adminClient.from("profile_tokens").update({ status: "revoked" }).eq("id", id);
  if (error) return status(error.message, "error");
  await loadDashboard();
});
admin$("admin-logout").addEventListener("click", async () => { await ProfilePortal.signOut(); admin$("admin-dashboard").hidden = true; admin$("admin-login").hidden = false; });

ProfilePortal.session().then(current => { if (current) showDashboard().catch(error => status(error.message, "error")); });
