let escolaId = null,
  alunoId = null;

async function inicializarSecretario() {
  const { user, perfil } = await verificarLogin("secretario");
  if (!user) return;
  escolaId = perfil.escola_id;
  document.getElementById("secNome").innerText = perfil.nome || "Secretário";
  const { data: escola } = await supabase
    .from("escolas")
    .select("nome")
    .eq("id", escolaId)
    .single();
  if (escola) document.getElementById("escolaNome").innerText = escola.nome;
  carregarAlunos();
}

async function carregarAlunos() {
  const { data } = await supabase
    .from("alunos")
    .select("*")
    .eq("escola_id", escolaId);
  const container = document.getElementById("listaAlunos");
  if (container) {
    container.innerHTML = "";
    data?.forEach((a) => {
      container.innerHTML += `<div class="lista-item"><div><strong>${a.nome}</strong><br><small>${a.turma} | ${a.responsavel}</small></div></div>`;
    });
  }
  const select = document.getElementById("notaAluno");
  if (select) {
    select.innerHTML = '<option value="">Selecione</option>';
    data?.forEach((a) => {
      select.innerHTML += `<option value="${a.id}">${a.nome} - ${a.turma}</option>`;
    });
  }
}

async function lancarNota() {
  const aluno = document.getElementById("notaAluno").value;
  const disciplina = document.getElementById("notaDisciplina").value;
  const valor = document.getElementById("notaValor").value;
  if (!aluno || !valor) {
    alert("Preencha todos os campos");
    return;
  }
  const { error } = await supabase
    .from("notas")
    .insert({
      escola_id: escolaId,
      aluno_id: aluno,
      disciplina,
      valor: parseFloat(valor),
      bimestre: "1º Bimestre",
    });
  if (error) {
    alert("Erro: " + error.message);
    return;
  }
  alert("✅ Nota lançada!");
}

function ativarMenu(menu) {
  document
    .querySelectorAll('[id^="menu-"]')
    .forEach((el) => el.classList.add("hidden"));
  document.getElementById(`menu-${menu}`).classList.remove("hidden");
}

async function logout() {
  await supabase.auth.signOut();
  localStorage.removeItem("secretario_logado");
  window.location.href = "../escola/index.html";
}

document.addEventListener("DOMContentLoaded", () => {
  inicializarSecretario();
  document.querySelectorAll(".menu-btn").forEach((btn) => {
    btn.onclick = () => ativarMenu(btn.getAttribute("data-menu"));
  });
});
