// CONFIGURAÇÃO DO SUPABASE
const SUPABASE_URL = "https://bwhndiqcxfqssxvzdorl.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_bT66RaV9OVzP8asg_S8geg_QSUD2v69";

// Inicializar Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ============================================
// FUNÇÕES GLOBAIS
// ============================================

// Verificar se usuário está logado
async function verificarLogin() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (!user) {
    window.location.href = "../escola/index.html";
    return null;
  }
  return user;
}

// Obter escola do usuário
async function getEscolaId(usuarioId) {
  const { data, error } = await supabase
    .from("usuarios")
    .select("escola_id")
    .eq("id", usuarioId)
    .single();
  if (error) return null;
  return data.escola_id;
}

// Logout
async function logout() {
  await supabase.auth.signOut();
  window.location.href = "../escola/index.html";
}
