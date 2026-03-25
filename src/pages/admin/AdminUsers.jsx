import React, { useEffect, useState } from "react";

const perfis = ["ADMIN", "PASTOR", "LIDER_CELULA", "SECRETARIO", "TESOUREIRO"];

export default function AdminUsers() {
  const [usuarios, setUsuarios] = useState([]);
  const [erro, setErro] = useState("");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [perfil, setPerfil] = useState("LIDER_CELULA");

  const token = localStorage.getItem("token")?.trim();

  const carregarUsuarios = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/usuarios", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/";
        return;
      }
      if (!res.ok) throw new Error("Erro ao carregar usuários");
      const data = await res.json();
      setUsuarios(data);
    } catch (err) {
      setErro(err.message);
    }
  };

  const adicionarUsuario = async (e) => {
    e.preventDefault();
    setErro("");
    try {
      const res = await fetch("http://localhost:8080/api/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ nome, email, senha, perfil }),
      });
      if (!res.ok) throw new Error("Erro ao criar usuário");
      setNome(""); setEmail(""); setSenha(""); setPerfil("PASTOR");
      carregarUsuarios();
    } catch (err) {
      setErro(err.message);
    }
  };

  const deletarUsuario = async (id) => {
    if (!window.confirm("Deseja realmente deletar este usuário?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao deletar usuário");
      carregarUsuarios();
    } catch (err) {
      setErro(err.message);
    }
  };

  const alternarStatus = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/usuarios/${id}/status`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Erro ao alterar status");
      carregarUsuarios();
    } catch (err) {
      setErro(err.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    carregarUsuarios();
  }, []);

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={styles.title}>👑 Painel Administrativo</h1>
        <button onClick={handleLogout} style={styles.logoutBtn}>Sair do Sistema</button>
      </header>

      <main style={styles.container}>
        {erro && <div style={styles.alert}>{erro}</div>}

        {/* FORMULÁRIO */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>➕ Novo Usuário</h2>
          <form onSubmit={adicionarUsuario} style={styles.formGrid}>
            <input style={styles.input} placeholder="Nome Completo" value={nome} onChange={(e) => setNome(e.target.value)} required />
            <input style={styles.input} placeholder="E-mail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input style={styles.input} placeholder="Senha" type="password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
            <select style={styles.select} value={perfil} onChange={(e) => setPerfil(e.target.value)}>
              {perfis.map((p) => (
                <option key={p} value={p}>{p.replace("_", " ")}</option>
              ))}
            </select>
            <button type="submit" style={styles.submitBtn}>Salvar Usuário</button>
          </form>
        </section>

        {/* LISTAGEM */}
        <section style={styles.card}>
          <h2 style={styles.cardTitle}>📋 Gestão de Usuários</h2>
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Nome</th>
                  <th style={styles.th}>Email</th>
                  <th style={styles.th}>Perfil</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} style={styles.tr}>
                    <td style={styles.td}><strong>{u.nome}</strong></td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}><span style={styles.badge}>{u.perfil}</span></td>
                    <td style={styles.td}>
                      <span style={u.ativo ? styles.statusAtivo : styles.statusInativo}>
                        {u.ativo ? "● Ativo" : "● Inativo"}
                      </span>
                    </td>
                    <td style={styles.td}>
                      <button style={styles.actionBtn(u.ativo ? "#f39c12" : "#27ae60")} onClick={() => alternarStatus(u.id)}>
                        {u.ativo ? "Suspender" : "Ativar"}
                      </button>
                      <button style={styles.actionBtn("#e74c3c")} onClick={() => deletarUsuario(u.id)}>Excluir</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

// ===================== ESTILOS MODERNIZADOS =====================
const styles = {
  page: {
    backgroundColor: "#f0f2f5",
    minHeight: "100vh",
    fontFamily: "'Segoe UI', Roboto, sans-serif",
    color: "#333",
  },
  header: {
    backgroundColor: "#fff",
    padding: "1rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
  },
  title: { fontSize: "1.5rem", color: "#2c3e50", margin: 0 },
  container: { maxWidth: "1100px", margin: "2rem auto", padding: "0 1rem" },
  card: {
    backgroundColor: "#fff",
    borderRadius: "12px",
    padding: "1.5rem",
    marginBottom: "2rem",
    boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
  },
  cardTitle: { marginTop: 0, marginBottom: "1.5rem", fontSize: "1.2rem", color: "#34495e", borderBottom: "2px solid #eee", paddingBottom: "10px" },
  formGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" },
  input: { padding: "12px", borderRadius: "6px", border: "1px solid #ddd", fontSize: "14px", outline: "none" },
  select: { padding: "12px", borderRadius: "6px", border: "1px solid #ddd", backgroundColor: "#fff" },
  submitBtn: { backgroundColor: "#4a90e2", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", transition: "0.3s" },
  logoutBtn: { backgroundColor: "#ffefef", color: "#d93025", border: "1px solid #ffcfcf", padding: "8px 16px", borderRadius: "6px", cursor: "pointer" },
  tableWrapper: { overflowX: "auto" },
  table: { width: "100%", borderCollapse: "collapse", marginTop: "10px" },
  th: { textAlign: "left", padding: "12px", borderBottom: "2px solid #edf2f7", color: "#718096", textTransform: "uppercase", fontSize: "12px" },
  td: { padding: "15px 12px", borderBottom: "1px solid #edf2f7", fontSize: "14px" },
  badge: { backgroundColor: "#f1f3f5", padding: "4px 8px", borderRadius: "4px", fontSize: "11px", fontWeight: "bold" },
  statusAtivo: { color: "#2ecc71", fontWeight: "bold" },
  statusInativo: { color: "#e74c3c", fontWeight: "bold" },
  alert: { backgroundColor: "#fff5f5", color: "#c53030", padding: "1rem", borderRadius: "8px", marginBottom: "1rem", borderLeft: "4px solid #c53030" },
  actionBtn: (color) => ({
    backgroundColor: "transparent",
    color: color,
    border: `1px solid ${color}`,
    padding: "5px 10px",
    borderRadius: "4px",
    cursor: "pointer",
    marginRight: "8px",
    fontSize: "12px",
    fontWeight: "600",
    transition: "all 0.2s",
    ":hover": { backgroundColor: color, color: "#fff" }
  }),
};