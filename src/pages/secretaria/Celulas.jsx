import { useState, useEffect } from "react";
import api from "../../services/api.js";

export default function Celulas() {
  const [celulas, setCelulas] = useState([]);
  const [lideresDisponiveis, setLideresDisponiveis] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const formInicial = {
    nome: "",
    liderId: "",
    anfitriao: "",
    endereco: "",
    bairro: "",
    diaSemana: "MONDAY",
    horario: "19:30"
  };

  const [form, setForm] = useState(formInicial);

  const carregarDados = async () => {
    try {
      const [resCelulas, resUsuarios] = await Promise.all([
        api.get("/celulas"),
        api.get("/usuarios")
      ]);

      setCelulas(Array.isArray(resCelulas.data) ? resCelulas.data : []);
      setLideresDisponiveis(Array.isArray(resUsuarios.data) ? resUsuarios.data : []);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  const abrirModalNovo = () => {
    setEditandoId(null);
    setForm(formInicial);
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (c) => {
    setEditandoId(c.id);
    setForm({
      nome: c.nome || "",
      liderId: c.liderId || "",
      anfitriao: c.anfitriao || "",
      endereco: c.endereco || "",
      bairro: c.bairro || "",
      diaSemana: c.diaSemana || "MONDAY",
      horario: c.horario || ""
    });
    setIsModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`/celulas/${editandoId}`, form);
      } else {
        await api.post("/celulas", form);
      }
      fecharModal();
      carregarDados();
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar. Verifique os campos obrigatórios.");
    }
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setForm(formInicial);
    setEditandoId(null);
  };

  const traduzirDia = (dia) => {
    const dias = {
      MONDAY: "Segunda",
      TUESDAY: "Terça",
      WEDNESDAY: "Quarta",
      THURSDAY: "Quinta",
      FRIDAY: "Sexta",
      SATURDAY: "Sábado",
      SUNDAY: "Domingo"
    };
    return dias[dia] || dia;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-[600px] relative">

      {/* HEADER */}
      <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-green-600 to-green-800 rounded-t-2xl">
        <div>
          <h2 className="text-white font-bold text-lg">Células</h2>
          <p className="text-green-100 text-xs">{celulas.length} ativas</p>
        </div>
        <button
          onClick={abrirModalNovo}
          className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg transition-all"
        >
          ➕ Nova
        </button>
      </div>

      {/* LISTAGEM */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {celulas.map((c) => (
          <div
            key={c.id}
            onClick={() => abrirModalEdicao(c)}
            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md cursor-pointer transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center font-bold">
                {c.nome?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm">{c.nome}</p>
                <p className="text-[10px] text-gray-400">
                  Líder: {c.nomeLider}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-green-700">
                {traduzirDia(c.diaSemana)}
              </p>
              <p className="text-[9px] text-gray-400">{c.horario}</p>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b flex justify-between items-center">
              <h3 className="font-bold">
                {editandoId ? "Editar Célula" : "Nova Célula"}
              </h3>
              <button onClick={fecharModal}>&times;</button>
            </div>

            <form onSubmit={salvar} className="p-6 space-y-4">

              <input
                required
                placeholder="Nome da célula"
                className="w-full border p-2 rounded"
                value={form.nome}
                onChange={e => setForm({ ...form, nome: e.target.value })}
              />

              <select
                required
                className="w-full border p-2 rounded"
                value={form.liderId}
                onChange={e => setForm({ ...form, liderId: Number(e.target.value) })}
              >
                <option value="">Selecione o líder</option>
                {lideresDisponiveis.map(u => (
                  <option key={u.id} value={u.id}>{u.nome}</option>
                ))}
              </select>

              <input
                placeholder="Anfitrião"
                className="w-full border p-2 rounded"
                value={form.anfitriao}
                onChange={e => setForm({ ...form, anfitriao: e.target.value })}
              />

              <input
                placeholder="Endereço"
                className="w-full border p-2 rounded"
                value={form.endereco}
                onChange={e => setForm({ ...form, endereco: e.target.value })}
              />

              <input
                placeholder="Bairro"
                className="w-full border p-2 rounded"
                value={form.bairro}
                onChange={e => setForm({ ...form, bairro: e.target.value })}
              />

              <select
                className="w-full border p-2 rounded"
                value={form.diaSemana}
                onChange={e => setForm({ ...form, diaSemana: e.target.value })}
              >
                <option value="MONDAY">Segunda</option>
                <option value="TUESDAY">Terça</option>
                <option value="WEDNESDAY">Quarta</option>
                <option value="THURSDAY">Quinta</option>
                <option value="FRIDAY">Sexta</option>
                <option value="SATURDAY">Sábado</option>
                <option value="SUNDAY">Domingo</option>
              </select>

              <input
                type="time"
                className="w-full border p-2 rounded"
                value={form.horario}
                onChange={e => setForm({ ...form, horario: e.target.value })}
              />

              <div className="flex gap-2">
                <button type="button" onClick={fecharModal} className="flex-1 border p-2 rounded">
                  Cancelar
                </button>
                <button type="submit" className="flex-1 bg-green-600 text-white p-2 rounded">
                  Salvar
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
