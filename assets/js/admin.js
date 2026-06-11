// ============================================
// ESCOLA CLOUD - ADMIN.JS
// Painel do Dono (ESCOLA CLOUD)
// ============================================

let escolas = [];

// ============================================
// CARREGAR ESCOLAS DO SUPABASE
// ============================================
async function carregarEscolas() {
  const { data, error } = await supabase
    .from("escolas")
    .select("*")
    .order("criado_em", { ascending: false });

  if (!error && data) {
    escolas = data;
    atualizarDashboard();
    atualizarListaEscolas();
  }
}

function atualizarDashboard() {
  document.getElementById("totalEscolas").innerText = escolas.length;

  let totalAlunos = 0;
  escolas.forEach((escola) => {
    totalAlunos += escola.total_alunos || 0;
  });
  document.getElementById("totalAlunos").innerText = totalAlunos;
}

function atualizarListaEscolas() {
  const tbody = document.getElementById("listaEscolas");
  if (!tbody) return;

  tbody.innerHTML = "";
  if (escolas.length === 0) {
    tbody.innerHTML =
      '<tr><td colspan="5" style="text-align: center;">Nenhuma escola cadastrada</td></tr>';
    return;
  }

  escolas.forEach((escola) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
            <td><div class="logo-mini" style="width: 35px; height: 35px; font-size: 18px;">🏫</div> ${escola.nome}</td>
            <td>${escola.link}.escolacloud.com</td>
            <td>${escola.email || "N/A"}</td>
            <td>${escola.total_alunos || 0}</td>
            <td><span class="${escola.status === "ativo" ? "status-pago" : "status-pendente"}">${escola.status === "ativo" ? "✅ Ativo" : "🆓 Teste"}</span></td>
            <td><button class="btn-editar" onclick="verEscola('${escola.id}')">Ver</button></td>
        `;
    tbody.appendChild(tr);
  });
}

// ============================================
// CRIAR ESCOLA
// ============================================
async function criarEscola() {
  const nome = document.getElementById("escolaNome").value;
  const link = document.getElementById("escolaLink").value;
  const email = document.getElementById("diretorEmail").value;

  if (!nome || !link || !email) {
    alert("❌ Preencha todos os campos!");
    return;
  }

  // Verificar se link já existe
  const { data: existente } = await supabase
    .from("escolas")
    .select("id")
    .eq("link", link)
    .single();

  if (existente) {
    alert("❌ Este link já está em uso. Escolha outro.");
    return;
  }

  // Gerar senha temporária
  const senhaTemporaria = Math.random().toString(36).slice(-8);

  // Criar escola
  const { data: novaEscola, error: escolaError } = await supabase
    .from("escolas")
    .insert({
      nome: nome,
      link: link,
      email: email,
      plano: "teste",
      status: "ativo",
      criado_em: new Date().toISOString(),
    })
    .select()
    .single();

  if (escolaError) {
    alert("❌ Erro ao criar escola: " + escolaError.message);
    return;
  }

  // Criar usuário diretor
  const { error: userError } = await supabase.auth.signUp({
    email: email,
    password: senhaTemporaria,
    options: {
      data: {
        nome: `Diretor ${nome}`,
        perfil: "diretor",
        escola_id: novaEscola.id,
      },
    },
  });

  if (userError) {
    alert("❌ Erro ao criar diretor: " + userError.message);
    return;
  }

  // Salvar na tabela usuarios
  const { error: perfilError } = await supabase.from("usuarios").insert({
    email: email,
    nome: `Diretor ${nome}`,
    perfil: "diretor",
    escola_id: novaEscola.id,
    ativo: true,
  });

  if (perfilError) {
    console.error("Erro ao salvar perfil:", perfilError);
  }

  alert(
    `✅ Escola "${nome}" criada com sucesso!\n\n🔗 Link: https://${link}.escolacloud.com\n📧 Diretor: ${email}\n🔑 Senha temporária: ${senhaTemporaria}\n\nEnvie estas informações para o diretor.`,
  );

  // Limpar formulário
  document.getElementById("escolaNome").value = "";
  document.getElementById("escolaLink").value = "";
  document.getElementById("diretorEmail").value = "";

  // Recarregar lista
  carregarEscolas();
}

// ============================================
// VER ESCOLA
// ============================================
function verEscola(id) {
  const escola = escolas.find((e) => e.id === id);
  if (!escola) return;

  document.getElementById("modalTitulo").innerHTML = `🏫 ${escola.nome}`;
  document.getElementById("modalInfo").innerHTML = `
        <div class="modal-logo"><div style="width: 60px; height: 60px; background: var(--primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px; font-size: 30px;">🏫</div></div>
        <div class="info-row"><strong>Nome:</strong> ${escola.nome}</div>
        <div class="info-row"><strong>Link:</strong> ${escola.link}.escolacloud.com</div>
        <div class="info-row"><strong>Diretor:</strong> ${escola.email || "N/A"}</div>
        <div class="info-row"><strong>Alunos:</strong> ${escola.total_alunos || 0}</div>
        <div class="info-row"><strong>Status:</strong> ${escola.status === "ativo" ? "✅ Pago" : "🆓 Teste"}</div>
        <div class="info-row"><strong>Criado em:</strong> ${new Date(escola.criado_em).toLocaleDateString()}</div>
        <hr>
        <button class="btn-salvar" onclick="alert('Editar escola em desenvolvimento')" style="width: 100%; margin-top: 10px;">✏️ Editar</button>
        <button class="btn-excluir" onclick="excluirEscola('${escola.id}')" style="width: 100%; margin-top: 10px;">🗑️ Excluir</button>
    `;
  document.getElementById("modalEscola").style.display = "flex";
}

async function excluirEscola(id) {
  if (
    !confirm(
      "Tem certeza que deseja excluir esta escola? Todos os dados serão perdidos.",
    )
  )
    return;

  const { error } = await supabase.from("escolas").delete().eq("id", id);

  if (error) {
    alert("❌ Erro ao excluir escola: " + error.message);
    return;
  }

  alert("✅ Escola excluída com sucesso!");
  document.getElementById("modalEscola").style.display = "none";
  carregarEscolas();
}

function fecharModal() {
  document.getElementById("modalEscola").style.display = "none";
}

// ============================================
// INICIAR
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  carregarEscolas();

  document.getElementById("btnCriarEscola").onclick = criarEscola;
  document.getElementById("closeModal").onclick = fecharModal;

  window.onclick = (e) => {
    const modal = document.getElementById("modalEscola");
    if (e.target == modal) fecharModal();
  };
});
