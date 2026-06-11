// ============================================
// ESCOLA CLOUD - ESCOLA.JS
// Página pública da escola
// ============================================

// ============================================
// VARIÁVEIS GLOBAIS
// ============================================
let escolaId = null;
let eventos = [];
let recados = [];
let grupos = [];
let fotos = [];
let currentPerfil = "aluno";

// ============================================
// CARREGAR DADOS DA ESCOLA
// ============================================
async function carregarDadosEscola() {
  const escolaSalva = localStorage.getItem("escola_atual");
  if (escolaSalva) {
    const escola = JSON.parse(escolaSalva);
    document.getElementById("nomeEscola").innerText = escola.nome;
    document.title = escola.nome;
    escolaId = escola.id;
  } else {
    document.getElementById("nomeEscola").innerText =
      "Escola Aquarela do Saber";
    document.title = "Escola Aquarela do Saber";
    escolaId = 1;
  }

  await carregarEventos();
  await carregarRecados();
  await carregarGrupos();
  await carregarFotos();
  gerarCalendario();

  // Verificar se diretor está logado
  if (localStorage.getItem("diretor_logado") === "true") {
    document.getElementById("btnEditar").style.display = "block";
  }
}

// ============================================
// EVENTOS
// ============================================
async function carregarEventos() {
  const { data, error } = await supabase
    .from("eventos")
    .select("*")
    .eq("escola_id", escolaId)
    .order("data_evento", { ascending: true });

  if (!error && data) {
    eventos = data;
    atualizarListaEventos();
  }
}

function atualizarListaEventos() {
  const container = document.getElementById("listaEventos");
  if (!container) return;

  container.innerHTML =
    '<h3 style="margin-bottom: 10px; font-size: 16px;">📌 Eventos do Mês</h3>';
  if (eventos.length === 0) {
    container.innerHTML +=
      '<div style="padding: 8px; color: var(--gray);">Nenhum evento cadastrado</div>';
    return;
  }

  eventos.forEach((evento) => {
    container.innerHTML += `
            <div class="evento-lista" style="padding: 8px; border-bottom: 1px solid var(--border); display: flex; gap: 10px;">
                <span style="background: var(--primary); color: white; padding: 3px 10px; border-radius: 15px; font-size: 11px;">${evento.data_evento}</span>
                <span>${evento.titulo}</span>
            </div>
        `;
  });
}

function gerarCalendario() {
  const ano = 2026;
  const mes = 7;
  const primeiroDia = new Date(ano, mes, 1);
  const ultimoDia = new Date(ano, mes + 1, 0);
  const primeiroDiaSemana = primeiroDia.getDay();
  const totalDias = ultimoDia.getDate();

  let calendarioHTML = "";
  let dia = 1;

  for (let semana = 0; semana < 6; semana++) {
    calendarioHTML += "<tr>";
    for (let diaSemana = 0; diaSemana < 7; diaSemana++) {
      if (semana === 0 && diaSemana < primeiroDiaSemana) {
        calendarioHTML += "<td></td>";
      } else if (dia > totalDias) {
        calendarioHTML += "<td></td>";
      } else {
        const temEvento = eventos.filter(
          (e) => new Date(e.data_evento).getDate() === dia,
        );
        const classeEvento = temEvento.length > 0 ? "evento-dia" : "";
        let eventoHtml = "";
        if (temEvento.length > 0) {
          eventoHtml = `<div class="evento-marcador">${temEvento[0].titulo.substring(0, 12)}</div>`;
        }
        calendarioHTML += `<td class="${classeEvento}"><div class="dia-numero">${dia}</div>${eventoHtml}</td>`;
        dia++;
      }
    }
    calendarioHTML += "</tr>";
    if (dia > totalDias) break;
  }

  const calendarioBody = document.getElementById("calendarioBody");
  if (calendarioBody) calendarioBody.innerHTML = calendarioHTML;
}

// ============================================
// RECADOS
// ============================================
async function carregarRecados() {
  const { data, error } = await supabase
    .from("comunicados")
    .select("*")
    .eq("escola_id", escolaId)
    .eq("enviado_para", "mural")
    .order("enviado_em", { ascending: false });

  if (!error && data) {
    recados = data;
    atualizarRecados();
  }
}

function atualizarRecados() {
  const container = document.getElementById("muralContainer");
  if (!container) return;

  container.innerHTML = "";
  if (recados.length === 0) {
    container.innerHTML =
      '<div style="padding: 12px; color: var(--gray);">Nenhum recado cadastrado</div>';
    return;
  }

  recados.forEach((recado) => {
    container.innerHTML += `
            <div class="lista-item">
                <span>📌 ${recado.mensagem}</span>
            </div>
        `;
  });
}

// ============================================
// GRUPOS WHATSAPP
// ============================================
async function carregarGrupos() {
  const { data, error } = await supabase
    .from("grupos_whatsapp")
    .select("*")
    .eq("escola_id", escolaId)
    .eq("ativo", true)
    .order("ordem", { ascending: true });

  if (!error && data) {
    grupos = data;
    atualizarGrupos();
  }
}

function atualizarGrupos() {
  const container = document.getElementById("gruposContainer");
  if (!container) return;

  container.innerHTML = "";
  if (grupos.length === 0) {
    container.innerHTML =
      '<div style="padding: 12px; color: var(--gray);">Nenhum grupo cadastrado</div>';
    return;
  }

  grupos.forEach((grupo) => {
    container.innerHTML += `
            <div class="lista-item">
                <span>💬 ${grupo.nome}</span>
                <button class="btn-editar" onclick="window.open('${grupo.link}', '_blank')">Entrar</button>
            </div>
        `;
  });
}

// ============================================
// FOTOS
// ============================================
async function carregarFotos() {
  const { data, error } = await supabase
    .from("galeria")
    .select("*")
    .eq("escola_id", escolaId)
    .limit(10);

  if (!error && data) {
    fotos = data;
    atualizarFotos();
  }
}

function atualizarFotos() {
  const container = document.getElementById("galeriaContainer");
  if (!container) return;

  container.innerHTML = "";
  if (fotos.length === 0) {
    for (let i = 0; i < 5; i++) {
      container.innerHTML += '<div class="foto">📷</div>';
    }
    return;
  }

  fotos.forEach((foto) => {
    container.innerHTML += `<div class="foto" title="${foto.nome}">📸</div>`;
  });
}

// ============================================
// LOGIN
// ============================================
function fecharModal(modalId) {
  document.getElementById(modalId).style.display = "none";
}

function configurarPerfilButtons() {
  const btns = document.querySelectorAll(".perfil-btn");
  btns.forEach((btn) => {
    btn.onclick = () => {
      btns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentPerfil = btn.getAttribute("data-perfil");
      document
        .querySelectorAll('[id^="form-"]')
        .forEach((form) => form.classList.add("hidden"));
      document
        .getElementById(`form-${currentPerfil}`)
        .classList.remove("hidden");
    };
  });
}

async function loginDiretor() {
  const email = document.getElementById("diretorEmail").value;
  const senha = document.getElementById("diretorSenha").value;

  if (!email || !senha) {
    alert("Preencha e-mail e senha");
    return;
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha,
  });

  if (error) {
    alert("E-mail ou senha incorretos");
    return;
  }

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("perfil")
    .eq("id", data.user.id)
    .single();

  if (usuario.perfil !== "diretor") {
    alert("Acesso negado.");
    await supabase.auth.signOut();
    return;
  }

  localStorage.setItem("diretor_logado", "true");
  window.location.href = "../diretor/index.html";
}

async function loginProfessor() {
  const email = document.getElementById("professorEmail").value;
  const senha = document.getElementById("professorSenha").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha,
  });

  if (error) {
    alert("E-mail ou senha incorretos");
    return;
  }

  localStorage.setItem("professor_logado", "true");
  window.location.href = "../professor/index.html";
}

async function loginSecretario() {
  const email = document.getElementById("secretarioEmail").value;
  const senha = document.getElementById("secretarioSenha").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha,
  });

  if (error) {
    alert("E-mail ou senha incorretos");
    return;
  }

  localStorage.setItem("secretario_logado", "true");
  window.location.href = "../secretario/index.html";
}

async function loginAluno() {
  const email = document.getElementById("alunoEmail").value;
  const senha = document.getElementById("alunoSenha").value;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: senha,
  });

  if (error) {
    alert("E-mail ou senha incorretos");
    return;
  }

  localStorage.setItem("aluno_logado", "true");
  window.location.href = "../aluno/index.html";
}

function recuperarSenha() {
  alert("Entre em contato com o diretor da escola para recuperar sua senha.");
}

// ============================================
// EDITAR ESCOLA
// ============================================
function abrirModalEditar() {
  document.getElementById("nomeInput").value =
    document.getElementById("nomeEscola").innerText;
  document.getElementById("modalEditar").style.display = "flex";
}

function fecharModalEditar() {
  document.getElementById("modalEditar").style.display = "none";
}

async function salvarEdicaoEscola() {
  const novoNome = document.getElementById("nomeInput").value;
  if (novoNome) {
    document.getElementById("nomeEscola").innerText = novoNome;
    document.title = novoNome;
    alert("✅ Nome da escola atualizado!");
  }

  const file = document.getElementById("logoInput").files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const logoElement = document.getElementById("logoEscola");
      logoElement.innerHTML = `<img src="${e.target.result}" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover;">`;
    };
    reader.readAsDataURL(file);
    alert("✅ Logo atualizada!");
  }

  document.getElementById("modalEditar").style.display = "none";
}

// ============================================
// CHATBOT
// ============================================
function abrirChatbot() {
  alert(
    "🤖 Chatbot em desenvolvimento\n\nPor favor, entre em contato com a secretaria para mais informações.",
  );
}

// ============================================
// INICIAR
// ============================================
document.addEventListener("DOMContentLoaded", () => {
  carregarDadosEscola();
  configurarPerfilButtons();

  // Modais
  const modalLogin = document.getElementById("modalLogin");
  const modalEditar = document.getElementById("modalEditar");

  document.getElementById("btnLogin").onclick = () =>
    (modalLogin.style.display = "flex");
  document.getElementById("closeLogin").onclick = () =>
    (modalLogin.style.display = "none");
  document.getElementById("closeEditar").onclick = () =>
    (modalEditar.style.display = "none");
  document.getElementById("btnEditar").onclick = abrirModalEditar;
  document.getElementById("btnSalvarEdicao").onclick = salvarEdicaoEscola;
  document.getElementById("esqueciSenha").onclick = recuperarSenha;
  document.getElementById("chatbot").onclick = abrirChatbot;

  document.getElementById("btnLoginDiretor").onclick = loginDiretor;
  document.getElementById("btnLoginProfessor").onclick = loginProfessor;
  document.getElementById("btnLoginSecretario").onclick = loginSecretario;
  document.getElementById("btnLoginAluno").onclick = loginAluno;

  window.onclick = (e) => {
    if (e.target == modalLogin) modalLogin.style.display = "none";
    if (e.target == modalEditar) modalEditar.style.display = "none";
  };
});
