// ============================================
// ESCOLA CLOUD - DIRETOR.JS
// Painel do Diretor - TODAS as funcionalidades
// ============================================

let escolaId = null;
let usuarioId = null;
let professores = [];
let alunos = [];
let secretarios = [];
let notas = [];
let pagamentos = [];
let atividades = [];
let comunicados = [];
let enquetes = [];
let reunioes = [];
let eventos = [];
let fotos = [];
let recados = [];
let grupos = [];
let biblioteca = [];
let permissoes = [];

// ============================================
// INICIALIZAÇÃO
// ============================================
async function inicializarDiretor() {
  const { user, perfil } = await verificarLogin("diretor");
  if (!user) return;

  usuarioId = user.id;
  escolaId = perfil.escola_id;

  document.getElementById("diretorNome").innerText = perfil.nome || "Diretor";

  // Carregar nome da escola
  const { data: escola } = await supabase
    .from("escolas")
    .select("nome")
    .eq("id", escolaId)
    .single();

  if (escola) {
    document.getElementById("escolaNome").innerText = escola.nome;
  }

  await carregarTodosDados();
  atualizarDashboard();
  atualizarSelects();
}

async function carregarTodosDados() {
  // Professores
  const { data: profData } = await supabase
    .from("professores")
    .select("*")
    .eq("escola_id", escolaId);
  professores = profData || [];
  atualizarListaProfessores();

  // Alunos
  const { data: aluData } = await supabase
    .from("alunos")
    .select("*")
    .eq("escola_id", escolaId);
  alunos = aluData || [];
  atualizarListaAlunos();

  // Secretários
  const { data: secData } = await supabase
    .from("secretarios")
    .select("*")
    .eq("escola_id", escolaId);
  secretarios = secData || [];
  atualizarListaSecretarios();

  // Notas
  const { data: notaData } = await supabase
    .from("notas")
    .select("*")
    .eq("escola_id", escolaId);
  notas = notaData || [];
  atualizarListaNotas();

  // Pagamentos
  const { data: pagData } = await supabase
    .from("pagamentos")
    .select("*")
    .eq("escola_id", escolaId);
  pagamentos = pagData || [];
  atualizarListaFinanceiro();

  // Atividades
  const { data: ativData } = await supabase
    .from("atividades")
    .select("*")
    .eq("escola_id", escolaId);
  atividades = ativData || [];
  atualizarListaAtividades();

  // Comunicados
  const { data: comData } = await supabase
    .from("comunicados")
    .select("*")
    .eq("escola_id", escolaId);
  comunicados = comData || [];
  atualizarListaComunicados();

  // Enquetes
  const { data: encData } = await supabase
    .from("enquetes")
    .select("*")
    .eq("escola_id", escolaId);
  enquetes = encData || [];
  atualizarListaEnquetes();

  // Reuniões
  const { data: reuData } = await supabase
    .from("reunioes")
    .select("*")
    .eq("escola_id", escolaId);
  reunioes = reuData || [];
  atualizarListaReunioes();

  // Eventos
  const { data: eveData } = await supabase
    .from("eventos")
    .select("*")
    .eq("escola_id", escolaId);
  eventos = eveData || [];
  atualizarListaEventos();

  // Fotos
  const { data: fotData } = await supabase
    .from("galeria")
    .select("*")
    .eq("escola_id", escolaId);
  fotos = fotData || [];
  atualizarListaFotos();

  // Recados
  const { data: recData } = await supabase
    .from("mural")
    .select("*")
    .eq("escola_id", escolaId);
  recados = recData || [];
  atualizarListaRecados();

  // Grupos
  const { data: gruData } = await supabase
    .from("grupos_whatsapp")
    .select("*")
    .eq("escola_id", escolaId);
  grupos = gruData || [];
  atualizarListaGrupos();

  // Biblioteca
  const { data: bibData } = await supabase
    .from("biblioteca")
    .select("*")
    .eq("escola_id", escolaId);
  biblioteca = bibData || [];
  atualizarListaBiblioteca();

  // Permissões
  const { data: perData } = await supabase
    .from("permissoes")
    .select("*")
    .eq("escola_id", escolaId);
  permissoes = perData || [];
  atualizarListaPermissoes();
}

// ============================================
// DASHBOARD
// ============================================
function atualizarDashboard() {
  document.getElementById("totalAlunos").innerText = alunos.length;
  document.getElementById("totalProfessores").innerText = professores.length;
  document.getElementById("totalSecretarios").innerText = secretarios.length;

  const inadimplentes = alunos.filter((a) => {
    const pagamento = pagamentos.find((p) => p.aluno_id === a.id);
    return !pagamento;
  }).length;
  document.getElementById("totalInadimplentes").innerText = inadimplentes;
}

// ============================================
// PROFESSORES
// ============================================
function atualizarListaProfessores() {
  const container = document.getElementById("listaProfessores");
  if (!container) return;

  container.innerHTML = "";
  professores.forEach((prof) => {
    container.innerHTML += `
            <div class="lista-item">
                <div><strong>${prof.nome}</strong><br><small>${prof.disciplina} | ${prof.turmas}</small></div>
                <div><button class="btn-editar" onclick="editarProfessor('${prof.id}')">✏️</button><button class="btn-excluir" onclick="excluirProfessor('${prof.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function adicionarProfessor() {
  const nome = document.getElementById("profNome").value;
  const email = document.getElementById("profEmail").value;
  const disciplina = document.getElementById("profDisciplina").value;
  const turmas = document.getElementById("profTurmas").value;

  if (!nome) {
    alert("Preencha o nome do professor");
    return;
  }

  const { data, error } = await supabase
    .from("professores")
    .insert({
      escola_id: escolaId,
      nome: nome,
      email: email,
      disciplina: disciplina,
      turmas: turmas,
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  professores.push(data[0]);
  atualizarListaProfessores();
  atualizarDashboard();

  document.getElementById("profNome").value = "";
  document.getElementById("profEmail").value = "";
  document.getElementById("profDisciplina").value = "";
  document.getElementById("profTurmas").value = "";
  alert("✅ Professor adicionado!");
}

async function excluirProfessor(id) {
  if (!confirm("Excluir este professor?")) return;

  const { error } = await supabase.from("professores").delete().eq("id", id);

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  professores = professores.filter((p) => p.id !== id);
  atualizarListaProfessores();
  atualizarDashboard();
  alert("✅ Professor excluído!");
}

// ============================================
// ALUNOS
// ============================================
function atualizarListaAlunos() {
  const container = document.getElementById("listaAlunos");
  if (!container) return;

  container.innerHTML = "";
  alunos.forEach((aluno) => {
    container.innerHTML += `
            <div class="lista-item">
                <div><strong>${aluno.nome}</strong><br><small>${aluno.turma} | ${aluno.responsavel}</small></div>
                <div><button class="btn-editar" onclick="editarAluno('${aluno.id}')">✏️</button><button class="btn-excluir" onclick="excluirAluno('${aluno.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function adicionarAluno() {
  const nome = document.getElementById("alunoNome").value;
  const email = document.getElementById("alunoEmail").value;
  const turma = document.getElementById("alunoTurma").value;
  const responsavel = document.getElementById("alunoResponsavel").value;
  const whatsapp = document.getElementById("alunoWhatsapp").value;

  if (!nome) {
    alert("Preencha o nome do aluno");
    return;
  }

  const { data, error } = await supabase
    .from("alunos")
    .insert({
      escola_id: escolaId,
      nome: nome,
      email: email,
      turma: turma,
      responsavel: responsavel,
      whatsapp: whatsapp,
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  alunos.push(data[0]);
  atualizarListaAlunos();
  atualizarSelects();
  atualizarDashboard();

  document.getElementById("alunoNome").value = "";
  document.getElementById("alunoEmail").value = "";
  document.getElementById("alunoTurma").value = "";
  document.getElementById("alunoResponsavel").value = "";
  document.getElementById("alunoWhatsapp").value = "";
  alert("✅ Aluno adicionado!");
}

async function excluirAluno(id) {
  if (!confirm("Excluir este aluno?")) return;

  const { error } = await supabase.from("alunos").delete().eq("id", id);

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  alunos = alunos.filter((a) => a.id !== id);
  atualizarListaAlunos();
  atualizarSelects();
  atualizarDashboard();
  alert("✅ Aluno excluído!");
}

// ============================================
// SECRETÁRIOS
// ============================================
function atualizarListaSecretarios() {
  const container = document.getElementById("listaSecretarios");
  if (!container) return;

  container.innerHTML = "";
  secretarios.forEach((sec) => {
    container.innerHTML += `
            <div class="lista-item">
                <div><strong>${sec.nome}</strong><br><small>${sec.funcao} | ${sec.email}</small></div>
                <div><button class="btn-excluir" onclick="excluirSecretario('${sec.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function adicionarSecretario() {
  const nome = document.getElementById("secNome").value;
  const email = document.getElementById("secEmail").value;
  const funcao = document.getElementById("secFuncao").value;

  if (!nome) {
    alert("Preencha o nome do secretário");
    return;
  }

  const { data, error } = await supabase
    .from("secretarios")
    .insert({
      escola_id: escolaId,
      nome: nome,
      email: email,
      funcao: funcao,
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  secretarios.push(data[0]);
  atualizarListaSecretarios();
  atualizarDashboard();

  document.getElementById("secNome").value = "";
  document.getElementById("secEmail").value = "";
  document.getElementById("secFuncao").value = "";
  alert("✅ Secretário adicionado!");
}

async function excluirSecretario(id) {
  if (!confirm("Excluir este secretário?")) return;

  const { error } = await supabase.from("secretarios").delete().eq("id", id);

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  secretarios = secretarios.filter((s) => s.id !== id);
  atualizarListaSecretarios();
  alert("✅ Secretário excluído!");
}

// ============================================
// NOTAS
// ============================================
function atualizarListaNotas() {
  const container = document.getElementById("listaNotas");
  if (!container) return;

  container.innerHTML = "";
  notas.forEach((nota) => {
    const aluno = alunos.find((a) => a.id === nota.aluno_id);
    container.innerHTML += `
            <div class="lista-item">
                <div><strong>${aluno?.nome || "N/A"}</strong> | ${nota.disciplina} | ${nota.bimestre} | Nota: ${nota.valor}</div>
                <div><button class="btn-excluir" onclick="excluirNota('${nota.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function lancarNota() {
  const alunoId = document.getElementById("notaAluno").value;
  const disciplina = document.getElementById("notaDisciplina").value;
  const bimestre = document.getElementById("notaBimestre").value;
  const valor = document.getElementById("notaValor").value;

  if (!alunoId || !valor) {
    alert("Preencha todos os campos");
    return;
  }

  const { data, error } = await supabase
    .from("notas")
    .insert({
      escola_id: escolaId,
      aluno_id: alunoId,
      disciplina: disciplina,
      bimestre: bimestre,
      valor: parseFloat(valor),
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  notas.push(data[0]);
  atualizarListaNotas();
  document.getElementById("notaValor").value = "";
  alert("✅ Nota lançada!");
}

async function excluirNota(id) {
  const { error } = await supabase.from("notas").delete().eq("id", id);

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  notas = notas.filter((n) => n.id !== id);
  atualizarListaNotas();
  alert("✅ Nota excluída!");
}

// ============================================
// FINANCEIRO
// ============================================
function atualizarListaFinanceiro() {
  const container = document.getElementById("listaFinanceiro");
  if (!container) return;

  container.innerHTML = "";
  alunos.forEach((aluno) => {
    const pagamento = pagamentos.find((p) => p.aluno_id === aluno.id);
    const status = pagamento ? "pago" : "pendente";
    const statusClass = status === "pago" ? "status-pago" : "status-pendente";
    const statusText = status === "pago" ? "✅ Pago" : "🟡 Pendente";

    container.innerHTML += `
            <div class="lista-item">
                <div><strong>${aluno.nome}</strong><br><small>${aluno.turma} | ${aluno.responsavel}</small></div>
                <div class="${statusClass}">${statusText}</div>
            </div>
        `;
  });
}

async function registrarPagamento() {
  const alunoId = document.getElementById("pagamentoAluno").value;
  const desconto =
    parseFloat(document.getElementById("pagamentoDesconto").value) || 0;
  const valor = parseFloat(document.getElementById("pagamentoValor").value);
  const data = document.getElementById("pagamentoData").value;

  if (!alunoId || !valor) {
    alert("Preencha todos os campos");
    return;
  }

  const { data: pag, error } = await supabase
    .from("pagamentos")
    .insert({
      escola_id: escolaId,
      aluno_id: alunoId,
      valor_base: valor,
      desconto_percentual: desconto,
      valor_pago: valor * (1 - desconto / 100),
      data_pagamento: data || new Date().toISOString().split("T")[0],
      status: "pago",
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  pagamentos.push(pag[0]);
  atualizarListaFinanceiro();

  document.getElementById("pagamentoValor").value = "";
  document.getElementById("pagamentoDesconto").value = "";
  document.getElementById("pagamentoData").value = "";
  alert("✅ Pagamento registrado!");
}

// ============================================
// ATIVIDADES
// ============================================
function atualizarListaAtividades() {
  const container = document.getElementById("listaAtividades");
  if (!container) return;

  container.innerHTML = "";
  atividades.forEach((ativ) => {
    container.innerHTML += `
            <div class="lista-item">
                <div><strong>${ativ.titulo}</strong><br><small>Entrega: ${ativ.data_entrega}</small></div>
                <div><button class="btn-excluir" onclick="excluirAtividade('${ativ.id}')">🗑️</button></div>
            </div>
        `;
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

  const { data, error } = await supabase
    .from("atividades")
    .insert({
      escola_id: escolaId,
      titulo: titulo,
      descricao: descricao,
      data_entrega: dataEntrega,
      turma_id: turmaId || null,
      criado_por: usuarioId,
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  atividades.push(data[0]);
  atualizarListaAtividades();

  document.getElementById("ativTitulo").value = "";
  document.getElementById("ativDescricao").value = "";
  document.getElementById("ativData").value = "";
  alert("✅ Atividade criada!");
}

async function excluirAtividade(id) {
  const { error } = await supabase.from("atividades").delete().eq("id", id);

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  atividades = atividades.filter((a) => a.id !== id);
  atualizarListaAtividades();
  alert("✅ Atividade excluída!");
}

// ============================================
// COMUNICADOS
// ============================================
function atualizarListaComunicados() {
  const container = document.getElementById("listaComunicados");
  if (!container) return;

  container.innerHTML = "";
  comunicados.forEach((com) => {
    container.innerHTML += `
            <div class="lista-item">
                <div><strong>${com.assunto}</strong><br><small>${com.data_envio}</small><br>${com.mensagem}</div>
                <div><button class="btn-excluir" onclick="excluirComunicado('${com.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function enviarComunicado() {
  const assunto = document.getElementById("comunicadoAssunto").value;
  const mensagem = document.getElementById("comunicadoMensagem").value;

  if (!assunto || !mensagem) {
    alert("Preencha assunto e mensagem");
    return;
  }

  const { data, error } = await supabase
    .from("comunicados")
    .insert({
      escola_id: escolaId,
      remetente_id: usuarioId,
      assunto: assunto,
      mensagem: mensagem,
      enviado_para: "todos",
      data_envio: new Date().toISOString(),
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  comunicados.unshift(data[0]);
  atualizarListaComunicados();

  document.getElementById("comunicadoAssunto").value = "";
  document.getElementById("comunicadoMensagem").value = "";
  alert("✅ Comunicado enviado!");
}

// ============================================
// ENQUETES
// ============================================
function atualizarListaEnquetes() {
  const container = document.getElementById("listaEnquetes");
  if (!container) return;

  container.innerHTML = "";
  enquetes.forEach((enc) => {
    container.innerHTML += `
            <div class="lista-item">
                <div><strong>${enc.pergunta}</strong><br><small>Opções: ${enc.opcoes}</small></div>
                <div><button class="btn-excluir" onclick="excluirEnquete('${enc.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function criarEnquete() {
  const pergunta = document.getElementById("enquetePergunta").value;
  const opcoes = document.getElementById("enqueteOpcoes").value;

  if (!pergunta || !opcoes) {
    alert("Preencha pergunta e opções");
    return;
  }

  const { data, error } = await supabase
    .from("enquetes")
    .insert({
      escola_id: escolaId,
      criador_id: usuarioId,
      pergunta: pergunta,
      opcoes: opcoes,
      ativa: true,
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  enquetes.push(data[0]);
  atualizarListaEnquetes();

  document.getElementById("enquetePergunta").value = "";
  document.getElementById("enqueteOpcoes").value = "";
  alert("✅ Enquete criada!");
}

// ============================================
// REUNIÕES
// ============================================
function atualizarListaReunioes() {
  const container = document.getElementById("listaReunioes");
  if (!container) return;

  container.innerHTML = "";
  reunioes.forEach((reu) => {
    container.innerHTML += `
            <div class="lista-item">
                <div><strong>${reu.titulo}</strong><br><small>${reu.data} às ${reu.hora} | ${reu.local}</small></div>
                <div><button class="btn-excluir" onclick="excluirReuniao('${reu.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function agendarReuniao() {
  const titulo = document.getElementById("reuniaoTitulo").value;
  const data = document.getElementById("reuniaoData").value;
  const hora = document.getElementById("reuniaoHora").value;
  const local = document.getElementById("reuniaoLocal").value;

  if (!titulo || !data) {
    alert("Preencha os campos obrigatórios");
    return;
  }

  const { data: reu, error } = await supabase
    .from("reunioes")
    .insert({
      escola_id: escolaId,
      titulo: titulo,
      data: data,
      hora: hora,
      local: local,
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  reunioes.push(reu[0]);
  atualizarListaReunioes();

  document.getElementById("reuniaoTitulo").value = "";
  document.getElementById("reuniaoData").value = "";
  document.getElementById("reuniaoHora").value = "";
  document.getElementById("reuniaoLocal").value = "";
  alert("✅ Reunião agendada!");
}

// ============================================
// EVENTOS (CALENDÁRIO)
// ============================================
function atualizarListaEventos() {
  const container = document.getElementById("listaEventos");
  if (!container) return;

  container.innerHTML = "";
  eventos.forEach((eve) => {
    container.innerHTML += `
            <div class="lista-item">
                <div>📅 ${eve.data_evento} - ${eve.titulo}</div>
                <div><button class="btn-excluir" onclick="excluirEvento('${eve.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function adicionarEvento() {
  const data = document.getElementById("eventoData").value;
  const titulo = document.getElementById("eventoTitulo").value;

  if (!data || !titulo) {
    alert("Preencha data e título");
    return;
  }

  const { data: eve, error } = await supabase
    .from("eventos")
    .insert({
      escola_id: escolaId,
      data_evento: data,
      titulo: titulo,
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  eventos.push(eve[0]);
  atualizarListaEventos();

  document.getElementById("eventoData").value = "";
  document.getElementById("eventoTitulo").value = "";
  alert("✅ Evento adicionado!");
}

async function excluirEvento(id) {
  const { error } = await supabase.from("eventos").delete().eq("id", id);

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  eventos = eventos.filter((e) => e.id !== id);
  atualizarListaEventos();
  alert("✅ Evento excluído!");
}

// ============================================
// GALERIA
// ============================================
function atualizarListaFotos() {
  const container = document.getElementById("listaFotos");
  if (!container) return;

  container.innerHTML = "";
  fotos.forEach((foto) => {
    container.innerHTML += `
            <div class="lista-item">
                <div>📸 ${foto.nome}</div>
                <div><button class="btn-excluir" onclick="excluirFoto('${foto.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function adicionarFoto() {
  const nome = document.getElementById("fotoNome").value;

  if (!nome) {
    alert("Digite o nome da foto");
    return;
  }

  const { data, error } = await supabase
    .from("galeria")
    .insert({
      escola_id: escolaId,
      nome: nome,
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  fotos.push(data[0]);
  atualizarListaFotos();

  document.getElementById("fotoNome").value = "";
  alert("✅ Foto adicionada!");
}

async function excluirFoto(id) {
  const { error } = await supabase.from("galeria").delete().eq("id", id);

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  fotos = fotos.filter((f) => f.id !== id);
  atualizarListaFotos();
  alert("✅ Foto excluída!");
}

// ============================================
// MURAL
// ============================================
function atualizarListaRecados() {
  const container = document.getElementById("listaRecados");
  if (!container) return;

  container.innerHTML = "";
  recados.forEach((rec) => {
    container.innerHTML += `
            <div class="lista-item">
                <div>📢 ${rec.texto}</div>
                <div><button class="btn-excluir" onclick="excluirRecado('${rec.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function adicionarRecado() {
  const texto = document.getElementById("recadoTexto").value;

  if (!texto) {
    alert("Digite o recado");
    return;
  }

  const { data, error } = await supabase
    .from("mural")
    .insert({
      escola_id: escolaId,
      texto: texto,
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  recados.push(data[0]);
  atualizarListaRecados();

  document.getElementById("recadoTexto").value = "";
  alert("✅ Recado adicionado!");
}

async function excluirRecado(id) {
  const { error } = await supabase.from("mural").delete().eq("id", id);

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  recados = recados.filter((r) => r.id !== id);
  atualizarListaRecados();
  alert("✅ Recado excluído!");
}

// ============================================
// GRUPOS WHATSAPP
// ============================================
function atualizarListaGrupos() {
  const container = document.getElementById("listaGrupos");
  if (!container) return;

  container.innerHTML = "";
  grupos.forEach((grupo) => {
    container.innerHTML += `
            <div class="lista-item">
                <div>💬 ${grupo.nome}</div>
                <div><button class="btn-editar" onclick="window.open('${grupo.link}', '_blank')">🔗</button><button class="btn-excluir" onclick="excluirGrupo('${grupo.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function adicionarGrupo() {
  const nome = document.getElementById("grupoNome").value;
  const link = document.getElementById("grupoLink").value;

  if (!nome || !link) {
    alert("Preencha nome e link");
    return;
  }

  const { data, error } = await supabase
    .from("grupos_whatsapp")
    .insert({
      escola_id: escolaId,
      nome: nome,
      link: link,
      ativo: true,
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  grupos.push(data[0]);
  atualizarListaGrupos();

  document.getElementById("grupoNome").value = "";
  document.getElementById("grupoLink").value = "";
  alert("✅ Grupo adicionado!");
}

async function excluirGrupo(id) {
  const { error } = await supabase
    .from("grupos_whatsapp")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  grupos = grupos.filter((g) => g.id !== id);
  atualizarListaGrupos();
  alert("✅ Grupo excluído!");
}

// ============================================
// BIBLIOTECA
// ============================================
function atualizarListaBiblioteca() {
  const container = document.getElementById("listaBiblioteca");
  if (!container) return;

  container.innerHTML = "";
  biblioteca.forEach((bib) => {
    container.innerHTML += `
            <div class="lista-item">
                <div><strong>${bib.titulo}</strong><br><small>${bib.tipo} | ${bib.categoria}</small></div>
                <div><button class="btn-editar" onclick="window.open('${bib.url}', '_blank')">🔗</button><button class="btn-excluir" onclick="excluirConteudo('${bib.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function adicionarConteudo() {
  const tipo = document.getElementById("bibTipo").value;
  const titulo = document.getElementById("bibTitulo").value;
  const url = document.getElementById("bibUrl").value;
  const categoria = document.getElementById("bibCategoria").value;

  if (!titulo || !url) {
    alert("Preencha título e URL");
    return;
  }

  const { data, error } = await supabase
    .from("biblioteca")
    .insert({
      escola_id: escolaId,
      tipo: tipo,
      titulo: titulo,
      url: url,
      categoria: categoria,
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  biblioteca.push(data[0]);
  atualizarListaBiblioteca();

  document.getElementById("bibTitulo").value = "";
  document.getElementById("bibUrl").value = "";
  document.getElementById("bibCategoria").value = "";
  alert("✅ Conteúdo adicionado!");
}

async function excluirConteudo(id) {
  const { error } = await supabase.from("biblioteca").delete().eq("id", id);

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  biblioteca = biblioteca.filter((b) => b.id !== id);
  atualizarListaBiblioteca();
  alert("✅ Conteúdo excluído!");
}

// ============================================
// DELEGAR PERMISSÕES
// ============================================
function atualizarListaPermissoes() {
  const container = document.getElementById("listaPermissoes");
  if (!container) return;

  container.innerHTML = "";
  permissoes.forEach((per) => {
    const usuario = [...professores, ...secretarios].find(
      (u) => u.id === per.usuario_id,
    );
    container.innerHTML += `
            <div class="lista-item">
                <div>${usuario?.nome || "N/A"} - ${per.permissao}</div>
                <div><button class="btn-excluir" onclick="revogarPermissao('${per.id}')">🗑️</button></div>
            </div>
        `;
  });
}

async function delegarPermissao() {
  const usuarioId = document.getElementById("delegarUsuario").value;
  const permissao = document.getElementById("delegarPermissao").value;

  if (!usuarioId) {
    alert("Selecione um usuário");
    return;
  }

  const { data, error } = await supabase
    .from("permissoes")
    .insert({
      escola_id: escolaId,
      usuario_id: usuarioId,
      permissao: permissao,
      concedido_por: usuarioId,
    })
    .select();

  if (error) {
    alert("Erro: " + error.message);
    return;
  }

  permissoes.push(data[0]);
  atualizarListaPermissoes();
  alert("✅ Permissão delegada!");
}

// ============================================
// SELECTS
// ============================================
function atualizarSelects() {
  // Select alunos para notas
  const selectAluno = document.getElementById("notaAluno");
  if (selectAluno) {
    selectAluno.innerHTML = '<option value="">Selecione</option>';
    alunos.forEach((aluno) => {
      selectAluno.innerHTML += `<option value="${aluno.id}">${aluno.nome} - ${aluno.turma}</option>`;
    });
  }

  // Select alunos para pagamento
  const selectPagamento = document.getElementById("pagamentoAluno");
  if (selectPagamento) {
    selectPagamento.innerHTML = '<option value="">Selecione</option>';
    alunos.forEach((aluno) => {
      selectPagamento.innerHTML += `<option value="${aluno.id}">${aluno.nome} - ${aluno.turma}</option>`;
    });
  }

  // Select usuários para delegar
  const selectDelegar = document.getElementById("delegarUsuario");
  if (selectDelegar) {
    selectDelegar.innerHTML = '<option value="">Selecione</option>';
    professores.forEach((prof) => {
      selectDelegar.innerHTML += `<option value="${prof.id}">👨‍🏫 ${prof.nome} (Professor)</option>`;
    });
    secretarios.forEach((sec) => {
      selectDelegar.innerHTML += `<option value="${sec.id}">📋 ${sec.nome} (Secretário)</option>`;
    });
  }
}
// ============================================
// MENU
// ============================================
function ativarMenu(menu) {
    document.querySelectorAll('[id^="menu-"]').forEach(el => el.classList.add('hidden'));
    document.getElementById(`menu-${menu}`).classList.remove('hidden');
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-menu') === menu) btn.classList.add('active');
    });
}

// ============================================
// SAIR
// ============================================
async function logout() {
    await supabase.auth.signOut();
    localStorage.removeItem('diretor_logado');
    window.location.href = '../escola/index.html';
}

// ============================================
// INICIAR
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    inicializarDiretor();
    
    document.querySelectorAll('.menu-btn').forEach(btn => {
        btn.onclick = () => ativarMenu(btn.getAttribute('data-menu'));
    });
});