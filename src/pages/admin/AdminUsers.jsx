import React, { useEffect, useState, useCallback } from "react";
import api from "../../services/api.js";
import {
  UserPlus, Users, ShieldCheck, Power, Trash2, LogOut,
  Mail, Key, User, Shield, Loader2, RefreshCcw, Pencil, X
} from "lucide-react";

const perfis = ["ADMIN", "PASTOR", "LIDER_CELULA", "SECRETARIO", "TESOUREIRO"];

function handleLogout() {
  localStorage.clear();
  window.location.href = "/";
}

export default function AdminUsers() {
  const [usuarios, setUsuarios]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [sending, setSending]           = useState(false);
  const [erro, setErro]                 = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editandoId, setEditandoId]     = useState(null);
  const [form, setForm]                 = useState({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });

  const carregarUsuarios = useCallback(async () => {
    setLoading(true);
    setErro("");
    try {
      const res = await api.get("usuarios");
      setUsuarios(res.data);
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Não foi possível sincronizar os usuários.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { carregarUsuarios(); }, [carregarUsuarios]);

  const adicionarUsuario = async (e) => {
    e.preventDefault();
    setSending(true);
    setErro("");
    try {
      await api.post("usuarios", form);
      setForm({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Falha ao criar novo acesso.");
    } finally {
      setSending(false);
    }
  };

  const abrirEdicao = (u) => {
    setEditandoId(u.id);
    setForm({ nome: u.nome, email: u.email, senha: "", perfil: u.perfil });
    setIsEditModalOpen(true);
  };

  const salvarEdicao = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      await api.put(`usuarios/${editandoId}`, form);
      setIsEditModalOpen(false);
      setEditandoId(null);
      setForm({ nome: "", email: "", senha: "", perfil: "LIDER_CELULA" });
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao atualizar dados.");
    } finally {
      setSending(false);
    }
  };

  const deletarUsuario = async (id) => {
    if (!window.confirm("Esta ação removerá permanentemente o acesso. Confirmar?")) return;
    try {
      await api.delete(`usuarios/${id}`);
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao deletar.");
    }
  };

  const alternarStatus = async (id) => {
    try {
      await api.patch(`usuarios/${id}/status`);
      carregarUsuarios();
    } catch (err) {
      if (err.response?.status === 401) { handleLogout(); return; }
      setErro("Erro ao alterar status.");
    }
  };

  return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 pb-10 select-none touch-manipulation">

        {/* ── HEADER ── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2">
            <ShieldCheck size={11} />
            Controle de Acessos
          </span>
            <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter italic uppercase leading-none">
              Sistema<span className="text-indigo-500">.</span>
            </h2>
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mt-1">
              Privilégios &amp; Usuários
            </p>
          </div>

          {/* stat + logout */}
          <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-800/60 px-5 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center gap-3 shadow-sm">
              <Users size={18} className="text-indigo-500" />
              <div>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Usuários</p>
                <p className="text-lg font-black text-slate-800 dark:text-white leading-none">
                  {loading ? <span className="inline-block w-6 h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse align-middle" /> : usuarios.length}
                </p>
              </div>
            </div>
            <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 dark:text-slate-400 hover:border-red-400 hover:text-red-500 transition-all shadow-sm active:scale-95"
            >
              <LogOut size={15} />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* ── CONTEÚDO ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* ── FORMULÁRIO ── */}
          <section className="lg:col-span-4">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 shadow-sm sticky top-8">

              {/* título do form */}
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-indigo-600 text-white rounded-2xl">
                  <UserPlus size={16} />
                </div>
                <h3 className="font-black text-sm uppercase italic tracking-tighter dark:text-white">
                  Novo Acesso
                </h3>
              </div>

              <form onSubmit={adicionarUsuario} className="space-y-3">
                <CampoIcone icon={<User size={16} />} placeholder="Nome do usuário" value={form.nome} onChange={v => setForm({ ...form, nome: v })} />
                <CampoIcone icon={<Mail size={16} />} type="email" placeholder="E-mail institucional" value={form.email} onChange={v => setForm({ ...form, email: v })} />
                <CampoIcone icon={<Key size={16} />} type="password" placeholder="Senha de acesso" value={form.senha} onChange={v => setForm({ ...form, senha: v })} />

                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                  <select
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[12px] font-black text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                      value={form.perfil}
                      onChange={e => setForm({ ...form, perfil: e.target.value })}
                  >
                    {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g, " ")}</option>)}
                  </select>
                </div>

                <button
                    type="submit"
                    disabled={sending}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-[1.25rem] font-black uppercase tracking-[0.15em] text-[11px] transition-all shadow-md shadow-indigo-500/20 active:scale-95 flex items-center justify-center gap-2 mt-2"
                >
                  {sending ? <Loader2 size={16} className="animate-spin" /> : "Liberar Acesso"}
                </button>
              </form>
            </div>
          </section>

          {/* ── LISTAGEM ── */}
          <section className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-[2rem] overflow-hidden shadow-sm">

              {/* cabeçalho da lista */}
              <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-600 text-white rounded-2xl">
                    <Users size={14} />
                  </div>
                  <h3 className="font-black text-sm uppercase italic tracking-tighter dark:text-white">
                    Base de Usuários
                  </h3>
                </div>
                <button
                    onClick={carregarUsuarios}
                    className="p-2.5 bg-indigo-600 text-white rounded-xl active:scale-95 transition-transform"
                >
                  <RefreshCcw size={14} className={loading ? "animate-spin" : ""} />
                </button>
              </div>

              {/* stats rápidos */}
              <div className="grid grid-cols-2 gap-3 p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 flex items-center gap-3">
                  <div className="h-9 w-9 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Power size={16} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Ativos</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">
                      {loading ? "—" : usuarios.filter(u => u.ativo).length}
                    </p>
                  </div>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 flex items-center gap-3">
                  <div className="h-9 w-9 bg-slate-400/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Power size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Suspensos</p>
                    <p className="text-xl font-black text-slate-800 dark:text-white tracking-tighter">
                      {loading ? "—" : usuarios.filter(u => !u.ativo).length}
                    </p>
                  </div>
                </div>
              </div>

              {/* lista de usuários */}
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading && usuarios.length === 0 ? (
                    <div className="py-20 flex justify-center">
                      <Loader2 size={36} className="animate-spin text-indigo-500" />
                    </div>
                ) : usuarios.map(u => (
                    <div
                        key={u.id}
                        className="group flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      {/* identidade */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-sm flex-shrink-0 ${
                            u.ativo
                                ? "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}>
                          {u.nome?.charAt(0)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-black text-slate-800 dark:text-slate-100 truncate">{u.nome}</p>
                          <p className="text-[11px] text-slate-400 font-medium truncate">{u.email}</p>
                        </div>
                      </div>

                      {/* badges + controles */}
                      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                        {/* perfil */}
                        <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[9px] font-black rounded-lg uppercase tracking-tighter">
                      {u.perfil?.replace(/_/g, " ")}
                    </span>

                        {/* status */}
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter flex items-center gap-1 ${
                            u.ativo
                                ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"
                                : "bg-slate-100 dark:bg-slate-800 text-slate-400"
                        }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${u.ativo ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
                          {u.ativo ? "Ativo" : "Suspenso"}
                    </span>

                        {/* editar */}
                        <button
                            onClick={() => abrirEdicao(u)}
                            className="p-2 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all"
                            title="Editar"
                        >
                          <Pencil size={15} />
                        </button>

                        {/* alternar status */}
                        <button
                            onClick={() => alternarStatus(u.id)}
                            className={`p-2 rounded-xl transition-all ${
                                u.ativo
                                    ? "text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-500/10"
                                    : "text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10"
                            }`}
                            title="Alternar status"
                        >
                          <Power size={15} />
                        </button>

                        {/* deletar — visível só no hover (desktop) */}
                        <button
                            onClick={() => deletarUsuario(u.id)}
                            className="p-2 rounded-xl text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all sm:opacity-0 sm:group-hover:opacity-100"
                            title="Excluir"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* ── MODAL DE EDIÇÃO ── */}
        {isEditModalOpen && (
            <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-[100] flex items-end sm:items-center justify-center p-4">
              <div className="bg-white dark:bg-slate-900 rounded-[2rem] w-full max-w-md p-6 shadow-2xl border border-slate-200 dark:border-slate-800">

                {/* topo do modal */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 rounded-lg text-[10px] font-black uppercase tracking-widest mb-1">
                  <Pencil size={10} /> Editando
                </span>
                    <h3 className="text-2xl font-black italic uppercase tracking-tighter text-slate-900 dark:text-white leading-none">
                      Atualizar<span className="text-indigo-500">.</span>
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">ID: {editandoId}</p>
                  </div>
                  <button
                      onClick={() => setIsEditModalOpen(false)}
                      className="h-9 w-9 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-red-500 transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>

                <form onSubmit={salvarEdicao} className="space-y-3">
                  <CampoIcone icon={<User size={16} />} placeholder="Nome" value={form.nome} onChange={v => setForm({ ...form, nome: v })} />
                  <CampoIcone icon={<Mail size={16} />} type="email" placeholder="E-mail" value={form.email} onChange={v => setForm({ ...form, email: v })} />
                  <CampoIcone icon={<Key size={16} />} type="password" placeholder="Nova senha (deixe vazio para manter)" value={form.senha} onChange={v => setForm({ ...form, senha: v })} />

                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[12px] font-black text-slate-700 dark:text-white outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
                        value={form.perfil}
                        onChange={e => setForm({ ...form, perfil: e.target.value })}
                    >
                      {perfis.map(p => <option key={p} value={p}>{p.replace(/_/g, " ")}</option>)}
                    </select>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                        type="button"
                        onClick={() => setIsEditModalOpen(false)}
                        className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-500 py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                    >
                      Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={sending}
                        className="flex-[2] bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all shadow-md shadow-indigo-500/20 flex items-center justify-center gap-2 active:scale-95"
                    >
                      {sending ? <Loader2 size={15} className="animate-spin" /> : "Salvar Alterações"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
        )}

        {/* ── TOAST DE ERRO ── */}
        {erro && !isEditModalOpen && (
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3.5 rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl flex items-center gap-3 z-50 max-w-[90vw]">
              <Power size={15} />
              <span className="truncate">{erro}</span>
              <button onClick={() => setErro("")} className="ml-2 opacity-60 hover:opacity-100 flex-shrink-0">
                <X size={14} />
              </button>
            </div>
        )}
      </div>
  );
}

/* ── INPUT REUTILIZÁVEL ── */
function CampoIcone({ icon, ...props }) {
  return (
      <div className="relative">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </div>
        <input
            {...props}
            onChange={e => props.onChange(e.target.value)}
            className="w-full pl-11 pr-4 py-3.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-[13px] font-bold text-slate-700 dark:text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition-all"
        />
      </div>
  );
}