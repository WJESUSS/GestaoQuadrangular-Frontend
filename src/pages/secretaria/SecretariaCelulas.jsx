import { useEffect, useState } from "react";
import api from "../../services/api.js";
import { Trash2, UserPlus, Star, Users } from "lucide-react";

export default function SecretariaCelulas() {
  const [celulas, setCelulas] = useState([]);
  const [celulaSelecionada, setCelulaSelecionada] = useState(null);
  const [membros, setMembros] = useState([]);
  const [membrosSemCelula, setMembrosSemCelula] = useState([]);
  const [novoMembroId, setNovoMembroId] = useState("");

  const getToken = () => localStorage.getItem("token");

  // Carrega a lista de todas as células para o Select
  const carregarCelulas = () => {
    const token = getToken();
    if (!token) return;

    api
      .get("/celulas", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setCelulas(res.data))
      .catch((err) => console.error("Erro ao carregar células:", err));
  };

  // Carrega os membros vinculados à célula selecionada
  const carregarMembrosDaCelula = (celulaId) => {
    const token = getToken();
    if (!token) return;

    api
      .get(`/celulas/${celulaId}/membros`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMembros(res.data))
      .catch((err) => console.error("Erro ao carregar membros da célula:", err));
  };

  // Carrega pessoas que ainda não pertencem a nenhuma célula
  const carregarMembrosSemCelula = () => {
    const token = getToken();
    if (!token) return;

    api
      .get("/membros/sem-celula", { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setMembrosSemCelula(res.data))
      .catch((err) => console.error("Erro ao carregar membros sem célula:", err));
  };

  useEffect(() => {
    carregarCelulas();
    carregarMembrosSemCelula();
  }, []);

  useEffect(() => {
    if (celulaSelecionada) {
      carregarMembrosDaCelula(celulaSelecionada.id);
    } else {
      setMembros([]);
    }
  }, [celulaSelecionada]);

  const handleAdicionarMembro = () => {
    if (!novoMembroId || !celulaSelecionada) return;

    const token = getToken();
    api
      .post(
        `/celulas/adicionar/${celulaSelecionada.id}/membros/${novoMembroId}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setNovoMembroId("");
        carregarMembrosDaCelula(celulaSelecionada.id);
        carregarMembrosSemCelula();
      })
      .catch((err) => console.error("Erro ao adicionar membro:", err));
  };

  const handleRemoverMembro = (membroId) => {
    if (!window.confirm("Tem certeza que deseja remover este membro desta célula?")) return;

    const token = getToken();
    api
      .delete(`/celulas/${celulaSelecionada.id}/membros/${membroId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        carregarMembrosDaCelula(celulaSelecionada.id);
        carregarMembrosSemCelula();
      })
      .catch((err) => console.error("Erro ao remover membro:", err));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Users className="text-blue-600" /> Secretaria de Células
        </h1>
        <p className="text-gray-500">Gerencie a composição e liderança das células.</p>
      </header>

      {/* Seção de Seleção */}
      <div className="bg-white p-6 rounded-xl shadow-sm border mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecione a Célula para Gestão
        </label>
        <select
          className="border border-gray-300 p-3 rounded-lg w-full max-w-md focus:ring-2 focus:ring-blue-500 outline-none"
          value={celulaSelecionada?.id || ""}
          onChange={(e) => {
            const id = parseInt(e.target.value);
            const celula = celulas.find((c) => c.id === id);
            setCelulaSelecionada(celula || null);
          }}
        >
          <option value="">-- Escolha uma célula --</option>
          {celulas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nome} (Líder: {c.nomeLider || "Pendente"})
            </option>
          ))}
        </select>
      </div>

      {celulaSelecionada && (
        <div className="space-y-6 animate-in fade-in duration-500">
          {/* Card de Informação da Célula */}
          <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-blue-900">{celulaSelecionada.nome}</h2>
              <p className="text-blue-700 flex items-center gap-2 mt-1">
                <Star size={16} className="fill-blue-700" />
                <strong>Líder Atual:</strong> {celulaSelecionada.nomeLider || "Não atribuído"}
              </p>
            </div>
            <div className="text-right">
              <span className="text-sm text-blue-600 font-semibold uppercase tracking-wider">Status</span>
              <p className={`font-bold ${celulaSelecionada.ativa ? 'text-green-600' : 'text-red-600'}`}>
                {celulaSelecionada.ativa ? "● Ativa" : "○ Inativa"}
              </p>
            </div>
          </div>

          {/* Adicionar Membro */}
          <div className="bg-white p-6 rounded-xl shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Adicionar novo integrante</h3>
            <div className="flex gap-3">
              <select
                className="border border-gray-300 p-2 rounded-lg flex-1 focus:ring-2 focus:ring-green-500 outline-none"
                value={novoMembroId}
                onChange={(e) => setNovoMembroId(e.target.value)}
              >
                <option value="">Buscar pessoa sem célula...</option>
                {membrosSemCelula.map((m) => (
                  <option key={m.id} value={m.id}>{m.nome}</option>
                ))}
              </select>
              <button
                onClick={handleAdicionarMembro}
                disabled={!novoMembroId}
                className="bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors"
              >
                <UserPlus size={18} /> Vincular
              </button>
            </div>
          </div>

          {/* Tabela de Membros */}
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Nome</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Papel na Célula</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {membros.map((m) => (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-gray-900 font-medium">{m.nome}</td>
                    <td className="px-6 py-4">
                      {/* Lógica de comparação segura de IDs */}
                      {Number(m.id) === Number(celulaSelecionada.liderId) ? (
                        <span className="inline-flex items-center gap-1.5 py-1 px-3 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800 border border-yellow-200">
                          <Star size={12} fill="currentColor" /> LÍDER
                        </span>
                      ) : (
                        <span className="inline-flex items-center py-1 px-3 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                          Integrante
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => handleRemoverMembro(m.id)}
                        className="text-red-400 hover:text-red-600 p-2 rounded-full hover:bg-red-50 transition-all"
                        title="Remover da célula"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {membros.length === 0 && (
              <div className="p-12 text-center">
                <p className="text-gray-400">Nenhum membro vinculado a esta célula.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}