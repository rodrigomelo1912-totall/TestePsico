const adminClient = ProfilePortal.client;
const admin$ = id => document.getElementById(id);
const escapeAdmin = value => String(value ?? "").replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[character]);
let allTokens = [];

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

function dateInputValue(value) {
  if (!value) return "";
  const date = new Date(value);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

function renderTokens() {
  const name = admin$("filter-name").value.trim().toLocaleLowerCase("pt-BR");
  const company = admin$("filter-company").value.trim().toLocaleLowerCase("pt-BR");
  const state = admin$("filter-status").value;
  const start = admin$("filter-start-date").value;
  const end = admin$("filter-end-date").value;
  const filtered = allTokens.filter(token => {
    const batch = token.profile_token_batches || {};
    const matchesName = !name || String(batch.recipient_name || "").toLocaleLowerCase("pt-BR").includes(name);
    const matchesCompany = !company || String(batch.company || "").toLocaleLowerCase("pt-BR").includes(company);
    const day = dateInputValue(token.created_at);
    return matchesName && matchesCompany && (!state || token.status === state) && (!start || day >= start) && (!end || day <= end);
  });
  admin$("token-count").textContent = `${filtered.length} de ${allTokens.length}`;
  admin$("token-list").innerHTML = filtered.length ? filtered.map(token => `<tr><td>${escapeAdmin(token.code_hint)}</td><td>${escapeAdmin(token.profile_token_batches?.recipient_name || "Não informado")}</td><td>${escapeAdmin(token.profile_token_batches?.company || "Não informada")}</td><td><span class="token-status ${escapeAdmin(token.status)}">${escapeAdmin(token.status)}</span></td><td>${new Date(token.created_at).toLocaleDateString("pt-BR")}</td><td>${token.used_at ? new Date(token.used_at).toLocaleDateString("pt-BR") : "—"}</td><td class="token-actions">${token.status === "active" ? `<button type="button" class="text-button" data-revoke="${token.id}">Revogar</button>` : ""}${token.status !== "used" ? `<button type="button" class="text-button danger-button" data-delete="${token.id}">Excluir</button>` : ""}</td></tr>`).join("") : "<tr><td colspan=7>Nenhum token corresponde aos filtros.</td></tr>";
}

async function loadDashboard() {
  const [{ data: tokens, error: tokenError }, { data: submissions, error: submissionError }] = await Promise.all([
    adminClient.from("profile_tokens").select("id,code_hint,status,created_at,used_at,profile_token_batches(recipient_name,company)").order("created_at", { ascending: false }),
    adminClient.from("profile_submissions").select("id,name,email,phone,company,job_title,submitted_at,profile_tokens(code_hint)").order("submitted_at", { ascending: false })
  ]);
  if (tokenError || submissionError) throw tokenError || submissionError;
  allTokens = tokens;
  renderTokens();
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

admin$("token-batch-form").addEventListener("submit", async event => {
  event.preventDefault();
  const recipientName = admin$("batch-recipient-name").value.trim();
  const company = admin$("batch-company").value.trim();
  const quantity = Number(admin$("batch-quantity").value);
  if (!recipientName || !company || !Number.isInteger(quantity) || quantity < 1 || quantity > 100) return status("Informe nome, empresa e uma quantidade entre 1 e 100.", "error");
  const codes = Array.from({ length: quantity }, makeToken);
  const button = admin$("new-token");
  button.disabled = true;
  button.firstChild.textContent = "Gerando ";
  try {
    const { data: batch, error: batchError } = await adminClient.from("profile_token_batches").insert({ recipient_name: recipientName, company, quantity }).select("id").single();
    if (batchError) throw batchError;
    const tokenRows = await Promise.all(codes.map(async code => ({ batch_id: batch.id, code_hash: await sha256(code), code_hint: code.slice(-4) })));
    const { error } = await adminClient.from("profile_tokens").insert(tokenRows);
    if (error) throw error;
    admin$("generated-token").textContent = codes.join("\n");
    admin$("generated-token").hidden = false;
    admin$("copy-token").hidden = false;
    await loadDashboard();
    status(`${quantity} ${quantity === 1 ? "token gerado" : "tokens gerados"} para ${recipientName}.`, "success");
  } catch (error) { status(error.message || "Não foi possível gerar o lote de tokens.", "error"); }
  finally { button.disabled = false; button.firstChild.textContent = "Gerar tokens "; }
});

admin$("copy-token").addEventListener("click", async () => { await navigator.clipboard.writeText(admin$("generated-token").textContent); status("Tokens copiados.", "success"); });
admin$("token-list").addEventListener("click", async event => {
  const id = event.target.dataset.revoke;
  const deleteId = event.target.dataset.delete;
  if (!id && !deleteId) return;
  if (deleteId && !window.confirm("Excluir este token não utilizado? Esta ação não pode ser desfeita.")) return;
  const { error } = id
    ? await adminClient.from("profile_tokens").update({ status: "revoked" }).eq("id", id)
    : await adminClient.from("profile_tokens").delete().eq("id", deleteId);
  if (error) return status(error.message, "error");
  await loadDashboard();
});
for (const filterId of ["filter-name", "filter-company", "filter-status", "filter-start-date", "filter-end-date"]) admin$(filterId).addEventListener("input", renderTokens);
admin$("clear-token-filters").addEventListener("click", () => {
  for (const filterId of ["filter-name", "filter-company", "filter-status", "filter-start-date", "filter-end-date"]) admin$(filterId).value = "";
  renderTokens();
});
admin$("admin-logout").addEventListener("click", async () => { await ProfilePortal.signOut(); admin$("admin-dashboard").hidden = true; admin$("admin-login").hidden = false; });

ProfilePortal.session().then(current => { if (current) showDashboard().catch(error => status(error.message, "error")); });
