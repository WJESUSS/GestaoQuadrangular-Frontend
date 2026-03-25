import { useState, useEffect } from "react";
import api from "../../api/api";

export default function Membros() {
  const [membros, setMembros] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [statusOriginal, setStatusOriginal] = useState(null);

  const statusOptions = ["ATIVO", "INATIVO", "AFASTADO", "TRANSFERIDO", "FALECIDO"];

  const estadoCivilOptions = [
    { value: "SOLTEIRO", label: "Solteiro(a)" },
    { value: "CASADO", label: "Casado(a)" },
    { value: "DIVORCIADO", label: "Divorciado(a)" },
    { value: "VIUVO", label: "Viúvo(a)" },
    { value: "UNIAO_ESTAVEL", label: "União Estável" }
  ];

  const formInicial = {
    nome: "",
    email: "",
    telefone: "",
    endereco: "",
    cpf: "",
    estadoCivil: "SOLTEIRO",
    dataNascimento: "",
    dataConversao: "",
    dataBatismo: "",
    status: "ATIVO"
  };

  const [form, setForm] = useState(formInicial);

  const formatarDataParaInput = (data) => (!data ? "" : data.split("T")[0]);

  const listar = async () => {
    try {
      const res = await api.get("/membros");
      const data = Array.isArray(res.data) ? res.data : res.data.content || [];
      setMembros(data);
    } catch (err) {
      console.error("Erro ao listar membros:", err);
      setMembros([]);
    }
  };

  useEffect(() => {
    listar();
  }, []);

  const abrirModalNovo = () => {
    setEditandoId(null);
    setStatusOriginal(null);
    setForm(formInicial);
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (m) => {
    setEditandoId(m.id);
    setStatusOriginal(m.status);

    setForm({
      nome: m.nome || "",
      email: m.email || "",
      telefone: m.telefone || "",
      endereco: m.endereco || "",
      cpf: m.cpf || "",
      estadoCivil: m.estadoCivil || "SOLTEIRO",
      dataNascimento: formatarDataParaInput(m.dataNascimento),
      dataConversao: formatarDataParaInput(m.dataConversao),
      dataBatismo: formatarDataParaInput(m.dataBatismo),
      status: m.status || "ATIVO"
    });

    setIsModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        // 🔥 Alteração de status especial
        if (form.status !== statusOriginal) {
          const confirmar = window.confirm(
            "Ao alterar o status o membro será removido da célula e departamentos.\nDeseja continuar?"
          );
          if (!confirmar) return;

          await api.put(`/membros/${editandoId}/status`, null, {
            params: { status: form.status }
          });
        }

        // Atualiza os demais campos normalmente
        await api.put(`/membros/${editandoId}`, form);
      } else {
        await api.post("/membros", form);
      }

      fecharModal();
      listar();
    } catch (err) {
      console.error("Erro ao salvar membro:", err.response?.data || err.message);
      alert("Erro ao salvar membro.");
    }
  };

  const excluir = async () => {
    if (window.confirm(`Deseja realmente excluir ${form.nome}?`)) {
      try {
        await api.delete(`/membros/${editandoId}`);
        fecharModal();
        listar();
      } catch (err) {
        alert("Erro ao excluir membro.");
      }
    }
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setForm(formInicial);
    setEditandoId(null);
    setStatusOriginal(null);
  };

  const corStatus = (status) => {
    switch (status) {
      case "ATIVO": return "bg-green-100 text-green-700";
      case "INATIVO": return "bg-red-100 text-red-700";
      case "AFASTADO": return "bg-yellow-100 text-yellow-700";
      case "TRANSFERIDO": return "bg-blue-100 text-blue-700";
      case "FALECIDO": return "bg-gray-300 text-gray-800";
      default: return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-[600px] relative">
      {/* HEADER */}
      <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-blue-600 to-blue-800 rounded-t-2xl">
        <h2 className="text-white font-bold text-lg">👥 Membros</h2>
        <button
          onClick={abrirModalNovo}
          className="bg-white/20 hover:bg-white/40 text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          + Novo Membro
        </button>
      </div>

      {/* LISTAGEM */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {membros.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-sm">Nenhum membro encontrado.</div>
        ) : (
          membros.map((m) => (
            <div
              key={m.id}
              onClick={() => abrirModalEdicao(m)}
              className="flex justify-between p-3 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md cursor-pointer"
            >
              <div>
                <p className="font-bold text-sm">{m.nome}</p>
                <p className="text-xs text-gray-400">{m.email || "Sem e-mail"}</p>
              </div>
              <span className={`text-xs px-3 py-1 rounded-full font-bold ${corStatus(m.status)}`}>
                {m.status}
              </span>
            </div>
          ))
        )}
      </div>

      {/* MODAL COMPLETO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">{editandoId ? "Editar Membro" : "Novo Membro"}</h3>
              <button onClick={fecharModal} className="text-gray-400 hover:text-black text-2xl font-light">×</button>
            </div>

            <form onSubmit={salvar} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Nome */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nome Completo</label>
                <input
                  required
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.nome}
                  onChange={e => setForm({ ...form, nome: e.target.value })}
                />
              </div>

              {/* CPF */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">CPF</label>
                <input
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="000.000.000-00"
                  value={form.cpf}
                  onChange={e => setForm({ ...form, cpf: e.target.value })}
                />
              </div>

              {/* Email e Telefone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">E-mail</label>
                  <input
                    type="email"
                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Telefone</label>
                  <input
                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.telefone}
                    onChange={e => setForm({ ...form, telefone: e.target.value })}
                  />
                </div>
              </div>

              {/* Endereço */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Endereço</label>
                <input
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.endereco}
                  onChange={e => setForm({ ...form, endereco: e.target.value })}
                />
              </div>

              {/* Datas e Estado Civil */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Data Nascimento</label>
                  <input
                    type="date"
                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.dataNascimento}
                    onChange={e => setForm({ ...form, dataNascimento: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Estado Civil</label>
                  <select
                    className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    value={form.estadoCivil}
                    onChange={e => setForm({ ...form, estadoCivil: e.target.value })}
                  >
                    {estadoCivilOptions.map(op => (
                      <option key={op.value} value={op.value}>{op.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Status</label>
                <select
                  className="w-full border p-2.5 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                >
                  {statusOptions.map(s => (
                    <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>

              {/* Datas de Conversão e Batismo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-blue-500 uppercase ml-1">Data Conversão</label>
                  <input
                    type="date"
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    value={form.dataConversao}
                    onChange={e => setForm({ ...form, dataConversao: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-blue-500 uppercase ml-1">Data Batismo</label>
                  <input
                    type="date"
                    className="w-full border p-2 rounded-lg focus:ring-2 focus:ring-blue-400 outline-none"
                    value={form.dataBatismo}
                    onChange={e => setForm({ ...form, dataBatismo: e.target.value })}
                  />
                </div>
              </div>

              {/* Botões */}
              <div className="flex flex-col gap-2 pt-4">
                <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold hover:bg-blue-700">Salvar</button>
                {editandoId && (
                  <button
                    type="button"
                    onClick={excluir}
                    className="w-full text-red-500 text-xs font-bold hover:text-red-700"
                  >
                    EXCLUIR REGISTRO PERMANENTEMENTE
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}