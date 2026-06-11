let alunoId = null,
  escolaId = null;

async function inicializarAluno() {
  const { user, perfil } = await verificarLogin("aluno");
  if (!user) return;
  alunoId = user.id;
  escolaId = perfil.escola_id;
  document.getElementById("alunoNome").innerText = perfil.nome || "Aluno";
  const { data: escola } = await supabase
    .from("escolas")
    .select("nome")
    .eq("id", escolaId)
    .single();
  if (escola) document.getElementById("escolaNome").innerText = escola.nome;
  carregarAtividades();
  carregarNotas();
  carregarFinanceiro();
}

async function carregarAtividades() {
  const { data } = await supabase
    .from("atividades")
    .select("*")
    .eq("escola_id", escolaId);
  const container = document.getElementById("listaAtividades");
  if (container) {
    container.innerHTML = "";
    data?.forEach((a) => {
      container.innerHTML += `<div class="lista-item"><div><strong>${a.titulo}</strong><br><small>Entrega: ${a.data_entrega}</small><br>${a.descricao}</div><div><button class="btn-editar" onclick="responderAtividade('${a.id}')">Responder</button></div></div>`;
    });
  }
}

async function carregarNotas() {
  const { data } = await supabase
    .from("notas")
    .select("*")
    .eq("aluno_id", alunoId);
  const container = document.getElementById("listaNotas");
  if (container) {
    container.innerHTML = "";
    data?.forEach((n) => {
      container.innerHTML += `<div class="lista-item"><div><strong>${n.disciplina}</strong> - ${n.bimestre}: ${n.valor}</div></div>`;
    });
  }
}

function ativarMenu(menu) {
  document
    .querySelectorAll('[id^="menu-"]')
    .forEach((el) => el.classList.add("hidden"));
  document.getElementById(`menu-${menu}`).classList.remove("hidden");
}
async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem("aluno_logado");
  window.location.href = "../escola/index.html";
}
function responderAtividade(id) {
  alert(`Responder atividade ${id} - Em desenvolvimento`);
}
function enviarFeedback() {
  alert("Feedback enviado com sucesso!");
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarAluno();
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.onclick = () => ativarMenu(btn.getAttribute("data-menu"));
  });
});
