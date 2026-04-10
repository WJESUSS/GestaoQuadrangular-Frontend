import { useState, useEffect } from "react";
import api from "../../services/api.js";

export default function Visitantes() {
  const [visitantes, setVisitantes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);

  const formInicial = {
    nome: "", email: "", telefone: "",
    dataPrimeiraVisita: "", origem: "CONVITE",
    responsavelAcompanhamento: "", convertido: false
  };
  const [form, setForm] = useState(formInicial);

  const listar = async () => {
    try {
      const res = await api.get("/visitantes");
      setVisitantes(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Erro ao listar visitantes:", err); }
  };

  const abrirModalNovo = () => {
    setEditandoId(null);
    setForm(formInicial);
    setIsModalOpen(true);
  };

  const abrirModalEdicao = (v) => {
    setEditandoId(v.id);
    setForm({
      nome: v.nome || "",
      email: v.email || "",
      telefone: v.telefone || "",
      dataPrimeiraVisita: v.dataPrimeiraVisita || "",
      origem: v.origem || "CONVITE",
      responsavelAcompanhamento: v.responsavelAcompanhamento || "",
      convertido: v.convertido || false
    });
    setIsModalOpen(true);
  };

  const salvar = async (e) => {
    e.preventDefault();
    try {
      if (editandoId) {
        await api.put(`/visitantes/${editandoId}`, form);
      } else {
        await api.post("/visitantes", form);
      }
      fecharModal();
      listar();
    } catch (err) { alert("Erro ao salvar visitante."); }
  };

  const fecharModal = () => {
    setIsModalOpen(false);
    setForm(formInicial);
    setEditandoId(null);
  };

  useEffect(() => { listar(); }, []);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 flex flex-col h-[600px] relative">

      {/* HEADER */}
      <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-purple-600 to-purple-800 rounded-t-2xl">
        <h2 className="text-white font-bold text-lg flex items-center gap-2"><span>✨</span> Visitantes</h2>
        <button onClick={abrirModalNovo} className="bg-white/20 hover:bg-white/40 text-white px-3 py-1 rounded-lg text-sm transition-all">+ Novo</button>
      </div>

      {/* LISTAGEM */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
        {visitantes.map((v) => (
          <div
            key={v.id}
            onClick={() => abrirModalEdicao(v)}
            className="flex items-center justify-between p-3 rounded-xl bg-gray-50 hover:bg-white hover:shadow-md border border-transparent hover:border-purple-200 cursor-pointer transition-all group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold uppercase">
                {v.nome?.charAt(0)}
              </div>
              <div>
                <p className="font-bold text-gray-800 text-sm group-hover:text-purple-600">{v.nome}</p>
                <p className="text-[10px] text-gray-400">Origem: {v.origem}</p>
              </div>
            </div>
            {v.convertido && (
              <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-700">CONVERTIDO</span>
            )}
          </div>
        ))}
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">
            <div className="p-5 border-b bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-gray-700">{editandoId ? "Editar Visitante" : "Novo Visitante"}</h3>
              <button onClick={fecharModal} className="text-gray-400 hover:text-black text-xl">&times;</button>
            </div>

            <form onSubmit={salvar} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <input placeholder="Nome" required className="w-full border p-2 rounded-lg" value={form.nome || ""} onChange={e => setForm({...form, nome: e.target.value})} />

              <div className="grid grid-cols-2 gap-3">
                <input placeholder="E-mail" className="border p-2 rounded-lg" value={form.email || ""} onChange={e => setForm({...form, email: e.target.value})} />
                <input placeholder="Telefone" className="border p-2 rounded-lg" value={form.telefone || ""} onChange={e => setForm({...form, telefone: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-400 uppercase">Responsável pelo Acompanhamento</label>
                <input placeholder="Nome do obreiro/líder" className="w-full border p-2 rounded-lg" value={form.responsavelAcompanhamento || ""} onChange={e => setForm({...form, responsavelAcompanhamento: e.target.value})} />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Data da 1ª Visita</label>
                  <input type="date" className="w-full border p-2 rounded-lg" value={form.dataPrimeiraVisita || ""} onChange={e => setForm({...form, dataPrimeiraVisita: e.target.value})} />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-gray-400 uppercase">Origem</label>
                  <select className="w-full border p-2 rounded-lg bg-white" value={form.origem || ""} onChange={e => setForm({...form, origem: e.target.value})}>
                    <option value="CONVITE">Convite</option>
                    <option value="REDES_SOCIAIS">Redes Sociais</option>
                    <option value="ESPONTANEO">Espontâneo</option>
                    <option value="OUTRO">Outro</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-xl">
                <input
                  type="checkbox"
                  id="convertido"
                  checked={form.convertido}
                  onChange={e => setForm({...form, convertido: e.target.checked})}
                />
                <label htmlFor="convertido" className="text-sm font-bold text-purple-700">Já aceitou a Jesus (Convertido)?</label>
              </div>

              <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all">
                {editandoId ? "Atualizar Visitante" : "Cadastrar Visitante"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}