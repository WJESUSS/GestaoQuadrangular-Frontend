import React, { useState, useEffect, useCallback } from "react";
import api from "../../services/api.js";
import {
  Calendar,
  Users,
  BookOpen,
  Heart,
  AlertCircle,
  Loader2,
  RefreshCw,
  CheckCircle2,
  FileText,
} from "lucide-react";

export default function TelaFichas({ celula = {}, onSuccess }) {
  const initialState = {
    nome: "",
    dataNascimento: "",
    endereco: "",
    bairro: "",
    cidade: "",
    telefone: "",
    sexo: "",
    estadoCivil: "",
    rg: "",
    estado: "",
    tomaMedicamento: false,
    qualMedicamento: "",
    temProblemasSaude: false,
    qualProblemaSaude: "",
    temApneia: false,
    peso: "",
    altura: "",
    nomeLiderCelula: celula?.nome || "Líder da Célula",
    nomeFamiliarContato: "",
    telefoneFamiliarContato: "",
    aceitouJesus: false,
    jaEraCristao: false,
    nomeEncontro: "Encontro com Deus",
    localEncontro: "Centro de Treinamento",
    dataInicio: new Date().toISOString().split("T")[0],
    dataFim: "", // Calculado automaticamente
    frequentaCelula: false,
    nomeCelula: celula?.nome || "",
    outrosParticipantes: "",
    tipoEncontro: "ENCONTRO_COM_DEUS",
    nomeConvidador: celula?.lider?.nome || "Líder da Célula",
    celulaConvidador: celula?.nome || "Minha Célula",
  };

  const [form, setForm] = useState(initialState);
  const [minhasFichas, setMinhasFichas] = useState([]);
  const [loadingFichas, setLoadingFichas] = useState(false);
  const [enviando, setEnviando] = useState(false);

  // Carrega fichas enviadas pelo usuário logado
  const carregarMinhasFichas = useCallback(async () => {
    try {
      setLoadingFichas(true);
      const res = await api.get("/fichas-encontro/minhas-fichas");
      setMinhasFichas(res.data || []);
    } catch (err) {
      console.error("Erro ao carregar fichas:", err);
    } finally {
      setLoadingFichas(false);
    }
  }, []);

  useEffect(() => {
    carregarMinhasFichas();
  }, [carregarMinhasFichas]);

  // Atualiza dataFim automaticamente (+3 dias de exemplo)
  useEffect(() => {
    if (form.dataInicio) {
      const inicio = new Date(form.dataInicio);
      const fim = new Date(inicio);
      fim.setDate(inicio.getDate() + 3);
      setForm((prev) => ({
        ...prev,
        dataFim: fim.toISOString().split("T")[0],
      }));
    }
  }, [form.dataInicio]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    // Validação mínima
    if (!form.nome?.trim() || !form.dataNascimento || !form.telefone?.trim()) {
      alert("⚠️ Nome, Data de Nascimento e Telefone são obrigatórios.");
      return;
    }

    setEnviando(true);

    const dadosParaEnviar = {
      ...form,
      peso: form.peso ? parseFloat(form.peso) : null,
      altura: form.altura ? parseFloat(form.altura) : null,
      tipoEncontro: form.tipoEncontro || "ENCONTRO_COM_DEUS",
      frequentaCelula: !!form.nomeCelula?.trim(),
      dataFim: form.dataFim || form.dataInicio,
    };

    try {
      const response = await api.post("/fichas-encontro", dadosParaEnviar);

      if (response.status === 201 || response.status === 200) {
        alert("✅ Inscrição realizada com sucesso!");
        if (onSuccess) onSuccess();
        setForm(initialState);
        carregarMinhasFichas(); // Atualiza lista imediatamente
      }
    } catch (err) {
      console.error("Erro ao salvar ficha:", err);
      const msg = err.response?.data?.message || "Erro ao conectar com o servidor. Verifique os campos.";
      alert(`❌ Erro: ${msg}`);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 max-w-5xl mx-auto my-8">
      <div className="border-b border-slate-200 pb-6 mb-8">
        <h2 className="text-3xl md:text-4xl font-black text-slate-800 tracking-tight italic uppercase">
          Ficha de Inscrição - {form.nomeEncontro}
        </h2>
        <p className="text-emerald-600 font-bold uppercase text-sm tracking-widest mt-2">
          Local: {form.localEncontro}
        </p>
      </div>

      {/* Botão Atualizar + Lista de fichas */}
      <div className="mb-10">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-slate-700 flex items-center gap-2">
            <FileText size={20} className="text-emerald-600" />
            Minhas Inscrições
          </h3>
          <button
            onClick={carregarMinhasFichas}
            disabled={loadingFichas}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-medium transition disabled:opacity-50"
          >
            <RefreshCw size={16} className={loadingFichas ? "animate-spin" : ""} />
            Atualizar
          </button>
        </div>

        {loadingFichas ? (
          <div className="text-center py-10">
            <Loader2 className="w-8 h-8 text-emerald-600 animate-spin mx-auto" />
            <p className="text-slate-500 mt-2">Carregando suas fichas...</p>
          </div>
        ) : minhasFichas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {minhasFichas.map((ficha) => (
              <div
                key={ficha.id}
                className="bg-gradient-to-br from-emerald-50 to-teal-50 p-5 rounded-2xl border border-emerald-100 hover:border-emerald-300 transition-all hover:shadow-md"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold text-slate-800 text-lg">{ficha.nome}</p>
                    <p className="text-sm text-slate-600 mt-1">
                      {new Date(ficha.dataInicio).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-bold uppercase">
                    Enviada
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-slate-50 rounded-2xl border border-slate-200">
            <FileText size={40} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 font-medium">Você ainda não enviou nenhuma ficha.</p>
          </div>
        )}
      </div>

      {/* Formulário */}
      <form className="space-y-10" onSubmit={(e) => e.preventDefault()}>
        {/* SEÇÃO 1: DADOS PESSOAIS */}
        <section className="bg-gradient-to-br from-emerald-50 to-teal-50 p-8 rounded-3xl border border-emerald-100">
          <h3 className="text-xl font-black text-emerald-800 mb-6 flex items-center gap-3">
            <span className="bg-emerald-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">1</span>
            Dados Pessoais
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Nome Completo *</label>
              <input
                name="nome"
                value={form.nome}
                onChange={handleChange}
                required
                className="w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Data de Nascimento *</label>
              <input
                name="dataNascimento"
                value={form.dataNascimento}
                onChange={handleChange}
                type="date"
                required
                className="w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Sexo</label>
              <select
                name="sexo"
                value={form.sexo}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition font-medium"
              >
                <option value="">Selecione</option>
                <option value="MASCULINO">Masculino</option>
                <option value="FEMININO">Feminino</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Estado Civil</label>
              <select
                name="estadoCivil"
                value={form.estadoCivil}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition font-medium"
              >
                <option value="">Selecione</option>
                <option value="SOLTEIRO">Solteiro</option>
                <option value="CASADO">Casado</option>
                <option value="DIVORCIADO">Divorciado</option>
                <option value="VIÚVO">Viúvo</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Telefone / WhatsApp *</label>
              <input
                name="telefone"
                value={form.telefone}
                onChange={handleChange}
                required
                className="w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">RG</label>
              <input
                name="rg"
                value={form.rg}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Estado (UF)</label>
              <input
                name="estado"
                value={form.estado}
                onChange={handleChange}
                maxLength={2}
                className="w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition font-medium uppercase"
                placeholder="BA"
              />
            </div>
          </div>
        </section>

        {/* SEÇÃO 2: LOCALIZAÇÃO */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-blue-100">
          <h3 className="text-xl font-black text-indigo-800 mb-6 flex items-center gap-3">
            <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">2</span>
            Localização
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-2">Endereço (Rua, nº)</label>
              <input
                name="endereco"
                value={form.endereco}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Bairro</label>
              <input
                name="bairro"
                value={form.bairro}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition font-medium"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Cidade</label>
              <input
                name="cidade"
                value={form.cidade}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-slate-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition font-medium"
              />
            </div>
          </div>
        </section>

        {/* SEÇÃO 3: SAÚDE */}
        <section className="bg-gradient-to-br from-rose-50 to-red-50 p-8 rounded-3xl border border-rose-100">
          <h3 className="text-xl font-black text-rose-800 mb-6 flex items-center gap-3">
            <span className="bg-rose-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">3</span>
            Saúde e Biometria
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="tomaMedicamento"
                  checked={form.tomaMedicamento}
                  onChange={handleChange}
                  className="w-6 h-6 accent-emerald-600 rounded-lg"
                />
                <span className="text-sm font-bold text-slate-700 uppercase italic group-hover:text-emerald-700 transition">
                  Toma algum medicamento?
                </span>
              </label>
              {form.tomaMedicamento && (
                <input
                  name="qualMedicamento"
                  value={form.qualMedicamento}
                  onChange={handleChange}
                  placeholder="Quais medicamentos?"
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white font-medium text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                />
              )}
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="temProblemasSaude"
                  checked={form.temProblemasSaude}
                  onChange={handleChange}
                  className="w-6 h-6 accent-emerald-600 rounded-lg"
                />
                <span className="text-sm font-bold text-slate-700 uppercase italic group-hover:text-emerald-700 transition">
                  Problemas de saúde?
                </span>
              </label>
              {form.temProblemasSaude && (
                <input
                  name="qualProblemaSaude"
                  value={form.qualProblemaSaude}
                  onChange={handleChange}
                  placeholder="Quais problemas?"
                  className="w-full p-4 rounded-2xl border border-slate-200 bg-white font-medium text-slate-700 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
                />
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 mt-8">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-center">Peso (kg)</label>
              <input
                name="peso"
                value={form.peso}
                onChange={handleChange}
                type="number"
                step="0.1"
                placeholder="00.0"
                className="w-full p-4 rounded-2xl border border-slate-300 text-center font-bold text-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 text-center">Altura (m)</label>
              <input
                name="altura"
                value={form.altura}
                onChange={handleChange}
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full p-4 rounded-2xl border border-slate-300 text-center font-bold text-lg focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition"
              />
            </div>
          </div>
        </section>

        {/* SEÇÃO 4: VIDA ESPIRITUAL */}
        <section className="bg-gradient-to-br from-blue-50 to-indigo-50 p-8 rounded-3xl border border-indigo-100">
          <h3 className="text-xl font-black text-indigo-800 mb-6 flex items-center gap-3">
            <span className="bg-indigo-600 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">4</span>
            Vida Espiritual
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-center gap-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 cursor-pointer">
              <input
                type="checkbox"
                name="aceitouJesus"
                checked={form.aceitouJesus}
                onChange={handleChange}
                className="w-5 h-5 accent-indigo-600"
              />
              <span className="text-sm font-bold text-indigo-800 uppercase">Já aceitou Jesus?</span>
            </label>

            <label className="flex items-center gap-3 bg-indigo-50 p-4 rounded-2xl border border-indigo-100 cursor-pointer">
              <input
                type="checkbox"
                name="jaEraCristao"
                checked={form.jaEraCristao}
                onChange={handleChange}
                className="w-5 h-5 accent-indigo-600"
              />
              <span className="text-sm font-bold text-indigo-800 uppercase">Já era cristão?</span>
            </label>
          </div>
        </section>

        {/* Botão de envio */}
        <div className="pt-8">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={enviando}
            className={`w-full py-6 rounded-3xl font-black text-lg shadow-2xl transition-all flex items-center justify-center gap-3 ${
              enviando
                ? "bg-slate-400 cursor-wait"
                : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white active:scale-[0.98]"
            }`}
          >
            {enviando ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                Enviando inscrição...
              </>
            ) : (
              "Concluir Inscrição"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}