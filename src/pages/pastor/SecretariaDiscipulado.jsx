import React, { useEffect, useState } from "react";
import api from "../../services/api";

export default function SecretariaDiscipuladoSimples() {
  const [relatorios, setRelatorios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState(null);

  const carregar = async () => {
    try {
      setLoading(true);
      setErro(null);

      const token = localStorage.getItem("token");

      const res = await api.get("/discipulado/todos-relatorios", {
        headers: {
          Authorization: token
              ? `Bearer ${token.replace(/"/g, "").trim()}`
              : "",
        },
      });

      setRelatorios(res.data || []);
    } catch (e) {
      setErro({
        status: e.response?.status,
        data: e.response?.data,
        message: e.message,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
      <div style={{ padding: 20, fontFamily: "Arial" }}>
        <h2>Secretaria (Teste Produção)</h2>

        <button onClick={carregar} style={{ marginBottom: 20 }}>
          Recarregar
        </button>

        {loading && <p>Carregando...</p>}

        {erro && (
            <div style={{ background: "#fee", padding: 10 }}>
              <h4>Erro:</h4>
              <pre>{JSON.stringify(erro, null, 2)}</pre>
            </div>
        )}

        {!loading && !erro && (
            <table border="1" cellPadding="8">
              <thead>
              <tr>
                <th>Célula</th>
                <th>Líder</th>
                <th>Período</th>
                <th>Membros</th>
              </tr>
              </thead>
              <tbody>
              {relatorios.map((r) => (
                  <tr key={r.id}>
                    <td>{r.nomeCelula}</td>
                    <td>{r.nomeLider}</td>
                    <td>
                      {r.dataInicio} até {r.dataFim}
                    </td>
                    <td>{r.presencas?.length || 0}</td>
                  </tr>
              ))}
              </tbody>
            </table>
        )}
      </div>
  );
}