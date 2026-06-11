// ============================================
// ESCOLA CLOUD - PROFESSOR.JS
// ============================================

let escolaId = null;
let usuarioId = null;
let minhasTurmas = [];
let meusAlunos = [];
let minhasAtividades = [];
let minhasNotas = [];

async function inicializarProfessor() {
  const { user, perfil } = await verificarLogin("professor");
  if (!user) return;

  usuarioId = user.id;
  escolaId = perfil.escola_id;

  document.getElementById("professorNome").innerText =
    perfil.nome || "Professor";

  const { data: escola } = await supabase
    .from("escolas")
    .select("nome")
    .eq("id", escolaId)
    .single();
  if (escola) document.getElementById("escolaNome").innerText = escola.nome;

  await carregarDados();
  atualizarDashboard();
}

async function carregarDados() {
  const { data: turmas } = await supabase
    .from("professores_turmas")
    .select("turmas(*)")
    .eq("professor_id", usuarioId);
  minhasTurmas = turmas?.map((t) => t.turmas) || [];
  atualizarListaTurmas();

  const { data: alunos } = await supabase
    .from("alunos")
    .select("*")
    .eq("escola_id", escolaId);
  meusAlunos = alunos || [];

  const { data: atividades } = await supabase
    .from("atividades")
    .select("*")
    .eq("professor_id", usuarioId);
  minhasAtividades = atividades || [];
  atualizarListaAtividades();
}

function atualizarDashboard() {
  document.getElementById("totalAlunos").innerText = meusAlunos.length;
  document.getElementById("totalTurmas").innerText = minhasTurmas.length;
  document.getElementById("totalAtividades").innerText =
    minhasAtividades.length;
}

function atualizarListaTurmas() {
  const container = document.getElementById("listaTurmas");
  if (!container) return;
  container.innerHTML = "";
  minhasTurmas.forEach((turma) => {
    container.innerHTML += `<div class="lista-item"><div><strong>${turma.nome}</strong><br><small>${turma.serie} | ${turma.turno}</small></div></div>`;
  });
}

function atualizarListaAtividades() {
  const container = document.getElementById("listaAtividades");
  if (!container) return;
  container.innerHTML = "";
  minhasAtividades.forEach((ativ) => {
    container.innerHTML += `<div class="lista-item"><div><strong>${ativ.titulo}</strong><br><small>Entrega: ${ativ.data_entrega}</small></div><div><button class="btn-excluir" onclick="excluirAtividade('${ativ.id}')">🗑️</button></div></div>`;
  });
}

async function criarAtividade() {
  const titulo = document.getElementById("ativTitulo").value;
  const descricao = document.getElementById("ativDescricao").value;
  const dataEntrega = document.getElementById("ativData").value;
  const turmaId = document.getElementById("ativTurma").value;

  if (!titulo) {
    alert("Preencha o título");
    return;
  }

  const { error } = await supabase.from("atividades").insert({
    escola_id: escolaId,
    professor_id: usuarioId,
    titulo,
    descricao,
    data_entrega: dataEntrega,
    turma_id: turmaId || null,
  });
  if (error) {
    alert("Erro: " + error.message);
    return;
  }
  alert("✅ Atividade criada!");
  location.reload();
}

function ativarMenu(menu) {
  document
    .querySelectorAll('[id^="menu-"]')
    .forEach((el) => el.classList.add("hidden"));
  document.getElementById(`menu-${menu}`).classList.remove("hidden");
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (btn.getAttribute("data-menu") === menu) btn.classList.add("active");
  });
}

async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem("professor_logado");
  window.location.href = "../escola/index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarProfessor();
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.onclick = () => ativarMenu(btn.getAttribute("data-menu"));
  });
});
