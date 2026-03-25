import { useEffect, useState } from "react";

export default function Aniversariantes() {
  const [lista, setLista] = useState([]);
  const [enviados, setEnviados] = useState(new Set());

  // Chave única que muda todo dia (ex: aniversariantes_enviados_2026-03-03)
  const STORAGE_KEY = `aniversariantes_enviados_${new Date().toISOString().slice(0, 10)}`;

  useEffect(() => {
    // Carrega os enviados salvos do dia atual
    const enviadosSalvos = localStorage.getItem(STORAGE_KEY);
    if (enviadosSalvos) {
      setEnviados(new Set(JSON.parse(enviadosSalvos)));
    }

    // Carrega os aniversariantes
    const token = localStorage.getItem("token");

    fetch("http://localhost:8080/api/api/aniversariantes/hoje", {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("Aniversariantes carregados:", data);
        setLista(data || []);
      })
      .catch((err) => console.error("Erro aniversariantes:", err));
  }, []);

  // Salva no localStorage toda vez que enviados mudar
  useEffect(() => {
    if (enviados.size > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...enviados]));
    }
  }, [enviados]);

  const marcarComoEnviado = (id) => {
    setEnviados((prev) => {
      const novo = new Set(prev);
      novo.add(id);
      return novo;
    });
  };

  const enviarTodos = () => {
    const pendentes = lista.filter((item) => !enviados.has(item.id));

    if (pendentes.length === 0) {
      alert("Todos os aniversariantes de hoje já foram enviados.");
      return;
    }

    alert(`Enviando ${pendentes.length} mensagens pendentes... Aguarde.`);

    pendentes.forEach((item) => {
      window.open(item.linkWhatsApp, "_blank", "noopener,noreferrer");
      marcarComoEnviado(item.id);
    });
  };

  return (
    <div style={{ padding: "30px", fontFamily: "Arial, sans-serif" }}>
      <h2 style={{ color: "#333", marginBottom: "20px" }}>🎉 Aniversariantes do Dia</h2>

      {lista.length === 0 ? (
        <p style={{ color: "#666", fontSize: "1.1rem" }}>Nenhum aniversariante hoje.</p>
      ) : (
        <>
          <button
            onClick={enviarTodos}
            disabled={lista.every((item) => enviados.has(item.id))}
            style={{
              marginBottom: "25px",
              padding: "12px 24px",
              background: "#25D366",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1.1rem",
              fontWeight: "bold",
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
              opacity: lista.every((item) => enviados.has(item.id)) ? 0.6 : 1,
            }}
          >
            🚀 Enviar para Todos (pendentes)
          </button>

          <table
            border="1"
            cellPadding="12"
            style={{
              marginTop: "20px",
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "1rem",
              background: "#fff",
              boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
            }}
          >
            <thead>
              <tr style={{ background: "#f0f8ff", color: "#333" }}>
                <th style={{ padding: "12px", textAlign: "left" }}>Nome</th>
                <th style={{ padding: "12px", textAlign: "left" }}>Telefone</th>
                <th style={{ padding: "12px", textAlign: "center" }}>Ação</th>
              </tr>
            </thead>
            <tbody>
              {lista.map((m) => {
                const jaEnviado = enviados.has(m.id);
                return (
                  <tr
                    key={m.id}
                    style={{
                      background: jaEnviado ? "#e6ffe6" : "white",
                      textDecoration: jaEnviado ? "line-through" : "none",
                      color: jaEnviado ? "#666" : "#333",
                    }}
                  >
                    <td style={{ padding: "12px" }}>{m.nome}</td>
                    <td style={{ padding: "12px" }}>{m.telefone}</td>
                    <td style={{ padding: "12px", textAlign: "center" }}>
                      {jaEnviado ? (
                        <span style={{ color: "green", fontWeight: "bold" }}>✓ Enviado</span>
                      ) : (
                        <a
                          href={m.linkWhatsApp}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => marcarComoEnviado(m.id)}
                          style={{
                            color: "#25D366",
                            textDecoration: "none",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                        >
                          📲 Enviar
                        </a>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}