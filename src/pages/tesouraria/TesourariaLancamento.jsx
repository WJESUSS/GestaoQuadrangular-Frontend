import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import api from "../../api/api";

export default function TesourariaLancamento() {
  const [membros, setMembros] = useState([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState(null);

  const [form, setForm] = useState({
    membroNome: "",
    valorDizimo: "",
    valorOferta: "",
    tipoOferta: "BRONZE",
    dataLancamento: new Date().toISOString().split("T")[0],
  });

  const limparValor = (str) => {
    if (!str) return 0;
    // Substitui vírgula por ponto para o backend entender como Double/BigDecimal
    const limpo = str.toString().replace(",", ".").trim();
    const numero = Number(limpo);
    return isNaN(numero) ? 0 : numero;
  };

  useEffect(() => {
    const carregarMembros = async () => {
      try {
        setLoading(true);
        const res = await api.get("/tesouraria/select-nome");
        setMembros(res.data || []);
      } catch (err) {
        console.error(err);
        setErro("Erro ao carregar lista de membros.");
      } finally {
        setLoading(false);
      }
    };
    carregarMembros();
  }, []);

  const handleSalvar = async () => {
    setErro(null);
    if (!form.membroNome) {
      setErro("Selecione um membro para continuar.");
      return;
    }

    const vDizimo = limparValor(form.valorDizimo);
    const vOferta = limparValor(form.valorOferta);

    if (vDizimo <= 0 && vOferta <= 0) {
      setErro("Informe pelo menos um valor de Dízimo ou Oferta.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        membroNome: form.membroNome,
        valorDizimo: vDizimo > 0 ? vDizimo : null,
        valorOferta: vOferta > 0 ? vOferta : null,
        tipoOferta: vOferta > 0 ? form.tipoOferta : null,
        dataLancamento: form.dataLancamento,
      };

      await api.post("/tesouraria/lancar", payload);
      alert("Lançamento registrado com sucesso!");

      // Reseta o formulário
      setForm({
        membroNome: "",
        valorDizimo: "",
        valorOferta: "",
        tipoOferta: "BRONZE",
        dataLancamento: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      console.error(err);
      setErro("Erro ao registrar lançamento no servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 sm:p-8">
      <h2 className="text-3xl font-bold mb-6 text-center text-indigo-700">
        Lançamento – Dízimo e Oferta
      </h2>

      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg space-y-6">
        {erro && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-center rounded">
            {erro}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Seleção de Membro */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">Membro</label>
            <select
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none"
              value={form.membroNome}
              onChange={(e) => setForm({ ...form, membroNome: e.target.value })}
            >
              <option value="">Selecione um membro...</option>
              {membros.map((m, index) => (
                <option key={m.id ? `membro-${m.id}` : `membro-idx-${index}`} value={m.nome}>
                  {m.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">Data</label>
            <input
              type="date"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none"
              value={form.dataLancamento}
              onChange={(e) => setForm({ ...form, dataLancamento: e.target.value })}
            />
          </div>

          {/* Dízimo */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Valor do Dízimo (R$)
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none"
              value={form.valorDizimo}
              onChange={(e) => setForm({ ...form, valorDizimo: e.target.value })}
              placeholder="0,00"
            />
          </div>

          {/* Oferta */}
          <div>
            <label className="block mb-1 font-medium text-gray-700">
              Valor da Oferta (R$)
            </label>
            <input
              type="text"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none"
              value={form.valorOferta}
              onChange={(e) => setForm({ ...form, valorOferta: e.target.value })}
              placeholder="0,00"
            />
          </div>

          {/* Tipo de Oferta */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block mb-1 font-medium text-gray-700">Tipo de Oferta</label>
            <select
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-300 outline-none"
              value={form.tipoOferta}
              onChange={(e) => setForm({ ...form, tipoOferta: e.target.value })}
            >
              <option value="BRONZE">Bronze</option>
              <option value="PRATA">Prata</option>
              <option value="OURO">Ouro</option>
            </select>
          </div>
        </div>

        {/* Botão Salvar */}
        <button
          onClick={handleSalvar}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg text-white font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
            loading
              ? "bg-indigo-400 cursor-not-allowed"
              : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98]"
          }`}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" /> Registrando...
            </>
          ) : (
            <>
              <Save size={20} /> Registrar Lançamento
            </>
          )}
        </button>
      </div>
    </div>
  );
}