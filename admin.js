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
  const target = admin$(admin$("admin-dashboard").hidden ? "admin-status" : "dashboard-status");
  target.textContent = message;
  target.className = `admin-status ${type}`;
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
  admin$("token-list").innerHTML = filtered.length ? filtered.map(token => `<tr><td>${escapeAdmin(token.code_hint)}</td><td>${escapeAdmin(token.profile_token_batches?.recipient_name || "Não informado")}</td><td>${escapeAdmin(token.profile_token_batches?.company || "Não informada")}</td><td><span class="token-status ${escapeAdmin(token.status)}">${escapeAdmin(token.status)}</span></td><td>${new Date(token.created_at).toLocaleDateString("pt-BR")}</td><td>${token.used_at ? new Date(token.used_at).toLocaleDateString("pt-BR") : "—"}</td><td class="token-actions">${token.status === "active" ? `<button type="button" class="text-button" data-revoke="${token.id}">Revogar</button>` : ""}<button type="button" class="text-button danger-button" data-delete="${token.id}" data-used="${token.status === "used"}">Excluir</button></td></tr>`).join("") : "<tr><td colspan=7>Nenhum token corresponde aos filtros.</td></tr>";
}

async function loadDashboard() {
  const [{ data: tokens, error: tokenError }, { data: submissions, error: submissionError }] = await Promise.all([
    adminClient.from("profile_tokens").select("id,code_hint,status,created_at,used_at,profile_token_batches(recipient_name,company)").order("created_at", { ascending: false }),
    adminClient.from("profile_submissions").select("id,name,email,phone,company,job_title,submitted_at,profile_tokens(code_hint)").order("submitted_at", { ascending: false })
  ]);
  if (tokenError || submissionError) throw tokenError || submissionError;
  allTokens = tokens;
  renderTokens();
  admin$("submission-list").innerHTML = submissions.length ? submissions.map(item => `<tr><td><strong>${escapeAdmin(item.name)}</strong><small>${escapeAdmin(item.email)}</small></td><td>${escapeAdmin(item.phone)}</td><td>${escapeAdmin(item.company)}</td><td>${escapeAdmin(item.job_title)}</td><td>${escapeAdmin(item.profile_tokens?.code_hint || "—")}</td><td>${new Date(item.submitted_at).toLocaleString("pt-BR")}</td><td><button class="text-button" type="button" data-open-report="${item.id}">Abrir</button><button class="text-button" type="button" data-download-report="${item.id}">Baixar</button></td></tr>`).join("") : "<tr><td colspan=7>Nenhum laudo liberado ainda.</td></tr>";
}

async function showDashboard() {
  admin$("admin-login").hidden = true;
  admin$("admin-dashboard").hidden = false;
  await loadDashboard();
  await showAdminView(window.location.hash === "#conexoes" ? "connections" : "access", false);
}

function setConnectionStatus(available, modelName) {
  const state = admin$("connection-state");
  state.textContent = available ? "Chave configurada" : "Integração indisponível";
  state.closest(".connection-overview").dataset.connected = available ? "true" : "false";
  admin$("connection-description").textContent = available
    ? "A função encontrou a chave protegida no Supabase. Isso não verifica saldo nem permissões na OpenAI; chamadas reais exigem consentimento e um token de laudo usado."
    : "A função ou a chave não respondeu agora. O relatório local continua disponível.";
  admin$("connection-model").textContent = modelName || "—";
}

function renderUsage(data) {
  const summary = data?.summary || {};
  for (const [id, key] of Object.entries({
    "usage-requests": "requests", "usage-completed": "completed", "usage-input": "inputTokens",
    "usage-output": "outputTokens", "usage-total": "totalTokens"
  })) admin$(id).textContent = usageCount(summary[key] ?? 0);
  admin$("usage-failed").textContent = usageCount((Number(summary.failed) || 0) + (Number(summary.unknown) || 0));
  admin$("usage-missing-note").textContent = `${usageCount(summary.withoutUsage ?? 0)} chamada(s) sem contagem retornada`;
  admin$("usage-cached").textContent = usageCount(summary.cachedInputTokens ?? 0);
  admin$("usage-reasoning").textContent = usageCount(summary.reasoningOutputTokens ?? 0);
  admin$("usage-since").textContent = data?.firstRecordedAt
    ? `Medição iniciada em ${new Date(data.firstRecordedAt).toLocaleDateString("pt-BR")}. Os totais seguem o período selecionado.`
    : "Nenhuma chamada registrada desde a ativação da medição.";

  const bars = usageBars(data?.daily);
  const chart = admin$("usage-chart");
  chart.setAttribute("aria-label", bars.map(bar => `${bar.day}: ${bar.tokens} tokens, ${bar.requests} chamadas`).join("; ") || "Sem dados diários disponíveis");
  chart.innerHTML = bars.some(bar => bar.tokens)
    ? bars.map(bar => `<div class="usage-day" title="${escapeAdmin(bar.day)}: ${usageCount(bar.tokens)} tokens em ${usageCount(bar.requests)} chamadas"><span class="usage-day-value">${bar.tokens ? usageCount(bar.tokens) : ""}</span><span class="usage-day-track"><i style="height:${bar.height}%"></i></span><small>${escapeAdmin(bar.day.slice(8, 10))}</small></div>`).join("")
    : "<p class=\"usage-empty\">Ainda não há consumo de tokens registrado nos últimos 14 dias.</p>";

  const labels = { completed: "Concluída", failed: "Falha", unknown: "Sem retorno" };
  admin$("usage-list").innerHTML = data?.recent?.length
    ? data.recent.map(row => `<tr><td>${new Date(row.created_at).toLocaleString("pt-BR")}</td><td>${escapeAdmin(row.model)}</td><td><span class="usage-outcome ${escapeAdmin(row.outcome)}">${labels[row.outcome] || "—"}</span></td><td>${usageCount(row.input_tokens)}</td><td>${usageCount(row.output_tokens)}</td><td>${usageCount(row.total_tokens)}</td></tr>`).join("")
    : "<tr><td colspan=6>Nenhuma chamada registrada neste período.</td></tr>";
}

async function loadConnections() {
  const message = admin$("connection-message");
  message.textContent = "Atualizando integração e estatísticas...";
  const config = ProfilePortal.config;
  const [connection, usage] = await Promise.allSettled([
    fetch(`${config.url}/functions/v1/personalize-report`, {
      method: "POST", headers: { "Content-Type": "application/json", apikey: config.publishableKey },
      body: JSON.stringify({ action: "status" })
    }).then(async response => { if (!response.ok) throw new Error("Função indisponível."); return response.json(); }),
    adminClient.rpc("admin_profile_ai_usage", { p_since: usageSince(admin$("usage-period").value) })
  ]);
  setConnectionStatus(connection.status === "fulfilled" && connection.value.aiEnabled === true,
    connection.status === "fulfilled" ? connection.value.model : null);
  if (usage.status === "rejected" || usage.value.error) {
    message.textContent = "Não foi possível carregar o consumo. Confira se a migração de estatísticas foi aplicada no Supabase.";
    message.className = "admin-status error";
    return;
  }
  renderUsage(usage.value.data);
  message.textContent = "Dados atualizados. As contagens vêm das respostas da OpenAI API registradas por este projeto.";
  message.className = "admin-status success";
}

async function showAdminView(view, updateHash = true) {
  const target = view === "connections" ? "connections" : "access";
  admin$("admin-access-view").hidden = target !== "access";
  admin$("admin-connections-view").hidden = target !== "connections";
  document.querySelectorAll("[data-admin-view]").forEach(button => {
    const active = button.dataset.adminView === target;
    button.classList.toggle("active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (updateHash) history.replaceState(null, "", target === "connections" ? "#conexoes" : "#acessos");
  if (target === "connections") await loadConnections();
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
  if (deleteId && !window.confirm(event.target.dataset.used === "true" ? "Excluir este token usado? O laudo HTML e os dados vinculados serão apagados definitivamente." : "Excluir este token? Esta ação não pode ser desfeita.")) return;
  const { error } = id
    ? await adminClient.from("profile_tokens").update({ status: "revoked" }).eq("id", id)
    : await adminClient.rpc("delete_profile_token", { p_token_id: deleteId });
  if (error) return status(error.message, "error");
  await loadDashboard();
});
for (const filterId of ["filter-name", "filter-company", "filter-status", "filter-start-date", "filter-end-date"]) admin$(filterId).addEventListener("input", renderTokens);
admin$("clear-token-filters").addEventListener("click", () => {
  for (const filterId of ["filter-name", "filter-company", "filter-status", "filter-start-date", "filter-end-date"]) admin$(filterId).value = "";
  renderTokens();
});
admin$("submission-list").addEventListener("click", async event => {
  const id = event.target.dataset.openReport || event.target.dataset.downloadReport;
  if (!id) return;
  try {
    const { data, error } = await adminClient.from("profile_submissions").select("report_html,profile_tokens(code_hint)").eq("id", id).single();
    if (error) throw error;
    if (!data.report_html) throw new Error("Este laudo ainda não tem um arquivo HTML arquivado.");
    const url = URL.createObjectURL(new Blob([data.report_html], { type: "text/html;charset=utf-8" }));
    if (event.target.dataset.openReport) {
      admin$("report-frame").src = url;
      admin$("report-viewer").showModal();
    } else {
      const link = document.createElement("a"); link.href = url; link.download = `laudo-${data.profile_tokens?.code_hint || "xfield"}.html`; link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
  } catch (error) { status(error.message || "Não foi possível abrir o laudo.", "error"); }
});
admin$("close-report-viewer").addEventListener("click", () => admin$("report-viewer").close());
admin$("report-viewer").addEventListener("close", () => {
  const frame = admin$("report-frame");
  const url = frame.src;
  frame.removeAttribute("src");
  if (url.startsWith("blob:")) URL.revokeObjectURL(url);
});
document.querySelectorAll("[data-admin-view]").forEach(button => button.addEventListener("click", () => showAdminView(button.dataset.adminView)));
admin$("refresh-connections").addEventListener("click", loadConnections);
admin$("usage-period").addEventListener("change", loadConnections);
window.addEventListener("hashchange", () => {
  if (!admin$("admin-dashboard").hidden) showAdminView(window.location.hash === "#conexoes" ? "connections" : "access", false);
});
admin$("admin-logout").addEventListener("click", async () => { await ProfilePortal.signOut(); admin$("admin-dashboard").hidden = true; admin$("admin-login").hidden = false; });

ProfilePortal.session().then(current => { if (current) showDashboard().catch(error => status(error.message, "error")); });
